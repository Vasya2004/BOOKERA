"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from "@/lib/youtube/utils";
import { parseTagList, podcastFormSchema } from "@/lib/validators/podcast";
import { requireUser } from "@/server/actions/auth-helpers";
import { failure, success, type ActionResult } from "@/server/actions/result";
import { syncPodcastTags } from "@/server/actions/tags";
import type { PodcastStatus } from "@/types/database";

function emptyToNull(value: string | undefined) {
  return value && value.trim() ? value.trim() : null;
}

export async function createPodcast(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = podcastFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Проверьте поля формы.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const videoId = extractYouTubeVideoId(parsed.data.youtubeUrl);
  if (!videoId) {
    return failure("Не удалось извлечь videoId из ссылки.");
  }

  const { supabase, user } = await requireUser();
  const watchedAt =
    parsed.data.status === "watched" ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("podcasts")
    .insert({
      user_id: user.id,
      youtube_url: parsed.data.youtubeUrl,
      youtube_video_id: videoId,
      title: parsed.data.title,
      channel_title: emptyToNull(parsed.data.channelTitle),
      thumbnail_url: emptyToNull(parsed.data.thumbnailUrl) ?? getYouTubeThumbnailUrl(videoId),
      duration_seconds:
        parsed.data.durationSeconds === "" ? null : parsed.data.durationSeconds ?? null,
      published_at: emptyToNull(parsed.data.publishedAt),
      description: emptyToNull(parsed.data.description),
      status: parsed.data.status,
      personal_rating:
        parsed.data.personalRating === "" ? null : parsed.data.personalRating ?? null,
      watched_at: watchedAt,
      main_takeaway: emptyToNull(parsed.data.mainTakeaway),
      summary: emptyToNull(parsed.data.summary),
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return failure("Этот подкаст уже есть в вашей библиотеке.");
    }
    return failure(error.message);
  }

  await syncPodcastTags(data.id, parseTagList(parsed.data.tags));
  revalidatePath("/podcasts");
  redirect(`/podcasts/${data.id}`);
}

export async function updatePodcast(
  podcastId: string,
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = podcastFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Проверьте поля формы.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const videoId = extractYouTubeVideoId(parsed.data.youtubeUrl);
  if (!videoId) {
    return failure("Не удалось извлечь videoId из ссылки.");
  }

  const { supabase, user } = await requireUser();
  const currentStatus = String(formData.get("currentStatus") ?? "");
  const watchedAt =
    parsed.data.status === "watched" && currentStatus !== "watched"
      ? new Date().toISOString()
      : parsed.data.status === "watched"
        ? undefined
        : null;

  const { error } = await supabase
    .from("podcasts")
    .update({
      youtube_url: parsed.data.youtubeUrl,
      youtube_video_id: videoId,
      title: parsed.data.title,
      channel_title: emptyToNull(parsed.data.channelTitle),
      thumbnail_url: emptyToNull(parsed.data.thumbnailUrl) ?? getYouTubeThumbnailUrl(videoId),
      duration_seconds:
        parsed.data.durationSeconds === "" ? null : parsed.data.durationSeconds ?? null,
      published_at: emptyToNull(parsed.data.publishedAt),
      description: emptyToNull(parsed.data.description),
      status: parsed.data.status,
      personal_rating:
        parsed.data.personalRating === "" ? null : parsed.data.personalRating ?? null,
      watched_at: watchedAt,
      main_takeaway: emptyToNull(parsed.data.mainTakeaway),
      summary: emptyToNull(parsed.data.summary),
    })
    .eq("id", podcastId)
    .eq("user_id", user.id);

  if (error) {
    return failure(error.message);
  }

  await syncPodcastTags(podcastId, parseTagList(parsed.data.tags));
  revalidatePath(`/podcasts/${podcastId}`);
  revalidatePath("/podcasts");
  return success("Подкаст обновлён");
}

export async function updatePodcastStatus(
  podcastId: string,
  status: PodcastStatus,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("podcasts")
    .update({
      status,
      watched_at: status === "watched" ? new Date().toISOString() : null,
    })
    .eq("id", podcastId)
    .eq("user_id", user.id);

  if (error) {
    return failure(error.message);
  }

  revalidatePath(`/podcasts/${podcastId}`);
  revalidatePath("/podcasts");
  return success("Статус обновлён");
}

export async function deletePodcast(podcastId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("podcasts")
    .delete()
    .eq("id", podcastId)
    .eq("user_id", user.id);

  if (error) {
    return failure(error.message);
  }

  revalidatePath("/podcasts");
  redirect("/podcasts");
}
