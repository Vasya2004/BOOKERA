"use server";

import { requireUser } from "@/server/actions/auth-helpers";
import { failure, success, type ActionResult } from "@/server/actions/result";
import { tagNameSchema } from "@/lib/validators/book";

const tagColors = ["#7a4e1d", "#2f5d50", "#8c6a2f", "#6f4232", "#3f4f35", "#9a6f2f"];

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

export async function attachTagToBook(
  bookId: string,
  tagId: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("book_tags")
    .upsert({ book_id: bookId, tag_id: tagId, user_id: user.id });

  return error ? failure(error.message) : success("Тег добавлен");
}

export async function detachTagFromBook(
  bookId: string,
  tagId: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("book_tags")
    .delete()
    .eq("book_id", bookId)
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

export async function syncBookTags(bookId: string, tagNames: string[]) {
  const { supabase, user } = await requireUser();
  await supabase.from("book_tags").delete().eq("book_id", bookId).eq("user_id", user.id);

  for (const tagName of tagNames) {
    const created = await createTag(tagName);
    if (created.ok && created.tagId) {
      await attachTagToBook(bookId, created.tagId);
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
