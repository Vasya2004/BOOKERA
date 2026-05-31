"use server";

import { revalidatePath } from "next/cache";
import { noteFormSchema, parseTagList } from "@/lib/validators/book";
import { requireUser } from "@/server/actions/auth-helpers";
import { failure, success, type ActionResult } from "@/server/actions/result";
import { syncNoteTags } from "@/server/actions/tags";

const CHAPTER_NUMBER_MIGRATION_MESSAGE =
  "Колонка для глав заметок ещё не создана в Supabase. Выполните миграцию supabase/migrations/202606010001_add_note_chapter_number.sql в SQL Editor.";

function isMissingChapterNumberColumn(error: { message: string; code?: string }) {
  return (
    error.message.includes("chapter_number") &&
    (error.message.includes("does not exist") ||
      error.message.includes("schema cache") ||
      error.code === "PGRST204")
  );
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
  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      book_id: parsed.data.bookId,
      type: parsed.data.type,
      content: parsed.data.content,
      page_number:
        parsed.data.pageNumber === "" ? null : parsed.data.pageNumber ?? null,
      chapter_number: parsed.data.chapterNumber,
      is_favorite: Boolean(parsed.data.isFavorite),
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingChapterNumberColumn(error)) {
      return failure(CHAPTER_NUMBER_MIGRATION_MESSAGE);
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
  chapterNumber: string,
  tags: string,
): Promise<ActionResult> {
  if (!content.trim()) {
    return failure("Заметка не может быть пустой.");
  }

  const parsedChapterNumber = Number(chapterNumber);
  if (
    !Number.isInteger(parsedChapterNumber) ||
    parsedChapterNumber < 1 ||
    parsedChapterNumber > 20
  ) {
    return failure("Глава должна быть числом от 1 до 20.");
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("notes")
    .update({
      content: content.trim(),
      chapter_number: parsedChapterNumber,
    })
    .eq("id", noteId)
    .eq("book_id", bookId)
    .eq("user_id", user.id);

  if (error) {
    if (isMissingChapterNumberColumn(error)) {
      return failure(CHAPTER_NUMBER_MIGRATION_MESSAGE);
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
