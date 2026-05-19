"use server";

import { revalidatePath } from "next/cache";
import { parseTimestampToSeconds } from "@/lib/youtube/utils";
import { noteFormSchema, parseTagList } from "@/lib/validators/podcast";
import { requireUser } from "@/server/actions/auth-helpers";
import { failure, success, type ActionResult } from "@/server/actions/result";
import { syncNoteTags } from "@/server/actions/tags";
import type { NoteType } from "@/types/database";

export async function createNote(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = noteFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Проверьте поля заметки.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const timestampSeconds = parseTimestampToSeconds(parsed.data.timestamp ?? "");
  if (parsed.data.timestamp && timestampSeconds === null) {
    return failure("Таймкод должен быть в формате 12:34 или 1:02:03.");
  }

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      podcast_id: parsed.data.podcastId,
      type: parsed.data.type,
      content: parsed.data.content,
      timestamp_seconds: timestampSeconds,
      is_favorite: Boolean(parsed.data.isFavorite),
    })
    .select("id")
    .single();

  if (error) {
    return failure(error.message);
  }

  await syncNoteTags(data.id, parseTagList(parsed.data.tags));
  revalidatePath(`/podcasts/${parsed.data.podcastId}`);
  revalidatePath("/insights");
  revalidatePath("/dashboard");
  return success("Заметка сохранена");
}

export async function updateNote(
  noteId: string,
  podcastId: string,
  type: NoteType,
  content: string,
  timestamp: string,
  tags: string,
): Promise<ActionResult> {
  if (!content.trim()) {
    return failure("Заметка не может быть пустой.");
  }

  const timestampSeconds = parseTimestampToSeconds(timestamp);
  if (timestamp && timestampSeconds === null) {
    return failure("Таймкод должен быть в формате 12:34 или 1:02:03.");
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("notes")
    .update({
      type,
      content: content.trim(),
      timestamp_seconds: timestampSeconds,
    })
    .eq("id", noteId)
    .eq("podcast_id", podcastId)
    .eq("user_id", user.id);

  if (error) {
    return failure(error.message);
  }

  await syncNoteTags(noteId, parseTagList(tags));
  revalidatePath(`/podcasts/${podcastId}`);
  revalidatePath("/insights");
  revalidatePath("/dashboard");
  return success("Заметка обновлена");
}

export async function deleteNote(noteId: string, podcastId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("podcast_id", podcastId)
    .eq("user_id", user.id);

  if (error) {
    return failure(error.message);
  }

  revalidatePath(`/podcasts/${podcastId}`);
  revalidatePath("/insights");
  revalidatePath("/dashboard");
  return success("Заметка удалена");
}

export async function toggleFavoriteNote(
  noteId: string,
  podcastId: string,
  nextValue: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("notes")
    .update({ is_favorite: nextValue })
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) {
    return failure(error.message);
  }

  revalidatePath(`/podcasts/${podcastId}`);
  revalidatePath("/insights");
  revalidatePath("/dashboard");
  return success(nextValue ? "Добавлено в избранное" : "Удалено из избранного");
}
