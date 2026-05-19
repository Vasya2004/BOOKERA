"use server";

import { requireUser } from "@/server/actions/auth-helpers";
import { failure, success, type ActionResult } from "@/server/actions/result";
import { tagNameSchema } from "@/lib/validators/podcast";

const tagColors = ["#2563eb", "#0f766e", "#7c3aed", "#be123c", "#a16207", "#4d7c0f"];

export async function createTag(name: string): Promise<ActionResult & { tagId?: string }> {
  const parsed = tagNameSchema.safeParse(name);
  if (!parsed.success) {
    return failure("Tag name is invalid.");
  }

  const { supabase, user } = await requireUser();
  const color = tagColors[Math.abs(hashString(parsed.data)) % tagColors.length];
  const { data, error } = await supabase
    .from("tags")
    .upsert(
      {
        user_id: user.id,
        name: parsed.data,
        color,
      },
      { onConflict: "user_id,name" },
    )
    .select("id")
    .single();

  if (error) {
    return failure(error.message);
  }

  return { ok: true, tagId: data.id };
}

export async function attachTagToPodcast(
  podcastId: string,
  tagId: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("podcast_tags")
    .upsert({ podcast_id: podcastId, tag_id: tagId, user_id: user.id });

  return error ? failure(error.message) : success("Тег добавлен");
}

export async function detachTagFromPodcast(
  podcastId: string,
  tagId: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("podcast_tags")
    .delete()
    .eq("podcast_id", podcastId)
    .eq("tag_id", tagId)
    .eq("user_id", user.id);

  return error ? failure(error.message) : success("Тег удалён");
}

export async function attachTagToNote(noteId: string, tagId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("note_tags")
    .upsert({ note_id: noteId, tag_id: tagId, user_id: user.id });

  return error ? failure(error.message) : success("Тег добавлен");
}

export async function detachTagFromNote(noteId: string, tagId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("note_tags")
    .delete()
    .eq("note_id", noteId)
    .eq("tag_id", tagId)
    .eq("user_id", user.id);

  return error ? failure(error.message) : success("Тег удалён");
}

export async function syncPodcastTags(podcastId: string, tagNames: string[]) {
  const { supabase, user } = await requireUser();
  await supabase.from("podcast_tags").delete().eq("podcast_id", podcastId).eq("user_id", user.id);

  for (const tagName of tagNames) {
    const created = await createTag(tagName);
    if (created.ok && created.tagId) {
      await attachTagToPodcast(podcastId, created.tagId);
    }
  }
}

export async function syncNoteTags(noteId: string, tagNames: string[]) {
  const { supabase, user } = await requireUser();
  await supabase.from("note_tags").delete().eq("note_id", noteId).eq("user_id", user.id);

  for (const tagName of tagNames) {
    const created = await createTag(tagName);
    if (created.ok && created.tagId) {
      await attachTagToNote(noteId, created.tagId);
    }
  }
}

function hashString(value: string) {
  let hash = 0;
  for (const char of value) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0;
  }
  return hash;
}
