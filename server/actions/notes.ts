"use server";

import { revalidatePath } from "next/cache";
import { noteFormSchema, parseTagList } from "@/lib/validators/book";
import { normalizeChapterTitle } from "@/lib/notes/chapters";
import { requireUser } from "@/server/actions/auth-helpers";
import { failure, success, type ActionResult } from "@/server/actions/result";
import { syncNoteTags } from "@/server/actions/tags";

const CHAPTER_TITLE_MIGRATION_MESSAGE =
  "Колонка для названий глав ещё не создана в Supabase. Выполните миграцию supabase/migrations/202607020001_add_note_chapter_title.sql в SQL Editor.";

function isMissingChapterTitleColumn(error: { message: string; code?: string }) {
  return (
    error.message.includes("chapter_title") &&
    (error.message.includes("does not exist") ||
      error.message.includes("schema cache") ||
      error.code === "PGRST204")
  );
}

function emptyToNull(value: string | undefined) {
  return normalizeChapterTitle(value);
}

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

  const { supabase, user } = await requireUser();
  const chapterNumber =
    parsed.data.chapterNumber === "" || parsed.data.chapterNumber === undefined
      ? null
      : parsed.data.chapterNumber;

  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      book_id: parsed.data.bookId,
      type: parsed.data.type,
      content: parsed.data.content,
      page_number:
        parsed.data.pageNumber === "" ? null : parsed.data.pageNumber ?? null,
      chapter_number: chapterNumber,
      chapter_title: emptyToNull(parsed.data.chapterTitle),
      is_favorite: Boolean(parsed.data.isFavorite),
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingChapterTitleColumn(error)) {
      return failure(CHAPTER_TITLE_MIGRATION_MESSAGE);
    }
    return failure(error.message);
  }

  await syncNoteTags(data.id, parseTagList(parsed.data.tags));
  revalidatePath(`/library/${parsed.data.bookId}`);
  revalidatePath("/insights");
  revalidatePath("/dashboard");
  return success("Заметка сохранена");
}

export async function updateNote(
  noteId: string,
  bookId: string,
  content: string,
  chapterTitle: string,
  tags: string,
): Promise<ActionResult> {
  if (!content.trim()) {
    return failure("Заметка не может быть пустой.");
  }

  const normalizedTitle = normalizeChapterTitle(chapterTitle);
  if (normalizedTitle && normalizedTitle.length > 120) {
    return failure("Название главы не должно быть длиннее 120 символов.");
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("notes")
    .update({
      content: content.trim(),
      chapter_title: normalizedTitle,
    })
    .eq("id", noteId)
    .eq("book_id", bookId)
    .eq("user_id", user.id);

  if (error) {
    if (isMissingChapterTitleColumn(error)) {
      return failure(CHAPTER_TITLE_MIGRATION_MESSAGE);
    }
    return failure(error.message);
  }

  await syncNoteTags(noteId, parseTagList(tags));
  revalidatePath(`/library/${bookId}`);
  revalidatePath("/insights");
  revalidatePath("/dashboard");
  return success("Заметка обновлена");
}

export async function deleteNote(noteId: string, bookId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("book_id", bookId)
    .eq("user_id", user.id);

  if (error) {
    return failure(error.message);
  }

  revalidatePath(`/library/${bookId}`);
  revalidatePath("/insights");
  revalidatePath("/dashboard");
  return success("Заметка удалена");
}

export async function toggleFavoriteNote(
  noteId: string,
  bookId: string,
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

  revalidatePath(`/library/${bookId}`);
  revalidatePath("/insights");
  revalidatePath("/dashboard");
  return success(nextValue ? "Добавлено в избранное" : "Удалено из избранного");
}
