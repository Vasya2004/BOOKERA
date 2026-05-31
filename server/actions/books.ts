"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bookFormSchema, parseTagList } from "@/lib/validators/book";
import { requireUser } from "@/server/actions/auth-helpers";
import { failure, success, type ActionResult } from "@/server/actions/result";
import { syncBookTags } from "@/server/actions/tags";
import type { BookStatus } from "@/types/database";

const COVER_BUCKET = "book-covers";
const MAX_COVER_SIZE = 5 * 1024 * 1024;
const coverMimeToExtension = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const PAGE_COUNT_MIGRATION_MESSAGE =
  "Колонка для количества страниц ещё не создана в Supabase. Выполните миграцию supabase/migrations/202605310003_add_book_page_count.sql в SQL Editor.";

type CoverUploadResult =
  | { ok: true; publicUrl: string; path: string }
  | { ok: false; message: string };

function emptyToNull(value: string | undefined) {
  return value && value.trim() ? value.trim() : null;
}

function optionalNumber(value: number | "" | undefined) {
  return value === "" || value === undefined ? null : value;
}

function isMissingPageCountColumn(error: { message: string; code?: string }) {
  return (
    error.message.includes("page_count") &&
    (error.message.includes("does not exist") ||
      error.message.includes("schema cache") ||
      error.code === "PGRST204")
  );
}

function omitPageCount<T extends { page_count?: number | null }>(payload: T) {
  const next = { ...payload };
  delete next.page_count;
  return next;
}

function getCoverFile(formData: FormData) {
  const value = formData.get("coverFile");
  return value instanceof File && value.size > 0 ? value : null;
}

async function uploadCoverFile({
  supabase,
  userId,
  bookId,
  file,
}: {
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"];
  userId: string;
  bookId: string;
  file: File;
}): Promise<CoverUploadResult> {
  const extension = coverMimeToExtension.get(file.type);
  if (!extension) {
    return { ok: false, message: "Обложка должна быть JPG, PNG или WebP." };
  }

  if (file.size > MAX_COVER_SIZE) {
    return { ok: false, message: "Размер обложки не должен превышать 5 МБ." };
  }

  const path = `${userId}/${bookId}-${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from(COVER_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    if (error.message.includes("Bucket not found") || error.message.includes("book-covers")) {
      return {
        ok: false,
        message:
          "Storage bucket для обложек не настроен. Выполните миграцию supabase/migrations/202605310002_book_covers_storage.sql в Supabase SQL Editor.",
      };
    }
    return { ok: false, message: error.message };
  }

  const { data } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);
  return { ok: true as const, publicUrl: data.publicUrl, path };
}

export async function createBook(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = bookFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Проверьте поля книги.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { supabase, user } = await requireUser();
  const coverFile = getCoverFile(formData);
  const bookId = crypto.randomUUID();
  const finishedAt =
    parsed.data.status === "finished" ? new Date().toISOString() : null;
  const uploaded = coverFile
    ? await uploadCoverFile({
        supabase,
        userId: user.id,
        bookId,
        file: coverFile,
      })
    : null;

  if (uploaded && !uploaded.ok) {
    return uploaded;
  }

  const insertPayload = {
    id: bookId,
    user_id: user.id,
    title: parsed.data.title,
    author: emptyToNull(parsed.data.author),
    cover_url: uploaded?.publicUrl ?? emptyToNull(parsed.data.coverUrl),
    isbn: emptyToNull(parsed.data.isbn),
    published_year: optionalNumber(parsed.data.publishedYear),
    page_count: optionalNumber(parsed.data.pageCount),
    description: emptyToNull(parsed.data.description),
    status: parsed.data.status,
    personal_rating: optionalNumber(parsed.data.personalRating),
    finished_at: finishedAt,
    main_takeaway: emptyToNull(parsed.data.mainTakeaway),
    summary: emptyToNull(parsed.data.summary),
  };

  let { error } = await supabase
    .from("books")
    .insert(insertPayload)
    .select("id");

  if (error && isMissingPageCountColumn(error) && insertPayload.page_count === null) {
    const legacy = await supabase
      .from("books")
      .insert(omitPageCount(insertPayload))
      .select("id");
    error = legacy.error;
  }

  if (error) {
    if (uploaded?.path) {
      await supabase.storage.from(COVER_BUCKET).remove([uploaded.path]);
    }
    if (isMissingPageCountColumn(error)) {
      return failure(PAGE_COUNT_MIGRATION_MESSAGE);
    }
    return failure(error.message);
  }

  await syncBookTags(bookId, parseTagList(parsed.data.tags));
  revalidatePath("/library");
  redirect(`/library/${bookId}`);
}

export async function updateBook(
  bookId: string,
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = bookFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Проверьте поля книги.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { supabase, user } = await requireUser();
  const coverFile = getCoverFile(formData);
  const currentStatus = String(formData.get("currentStatus") ?? "");
  const finishedAt =
    parsed.data.status === "finished" && currentStatus !== "finished"
      ? new Date().toISOString()
      : parsed.data.status === "finished"
        ? undefined
        : null;

  let coverUrl = emptyToNull(parsed.data.coverUrl);
  if (coverFile) {
    const uploaded = await uploadCoverFile({
      supabase,
      userId: user.id,
      bookId,
      file: coverFile,
    });
    if (!uploaded.ok) {
      return uploaded;
    }
    coverUrl = uploaded.publicUrl;
  }

  const updatePayload = {
    title: parsed.data.title,
    author: emptyToNull(parsed.data.author),
    cover_url: coverUrl,
    isbn: emptyToNull(parsed.data.isbn),
    published_year: optionalNumber(parsed.data.publishedYear),
    page_count: optionalNumber(parsed.data.pageCount),
    description: emptyToNull(parsed.data.description),
    status: parsed.data.status,
    personal_rating: optionalNumber(parsed.data.personalRating),
    finished_at: finishedAt,
    main_takeaway: emptyToNull(parsed.data.mainTakeaway),
    summary: emptyToNull(parsed.data.summary),
  };

  let { error } = await supabase
    .from("books")
    .update(updatePayload)
    .eq("id", bookId)
    .eq("user_id", user.id);

  if (error && isMissingPageCountColumn(error) && updatePayload.page_count === null) {
    const legacy = await supabase
      .from("books")
      .update(omitPageCount(updatePayload))
      .eq("id", bookId)
      .eq("user_id", user.id);
    error = legacy.error;
  }

  if (error) {
    if (isMissingPageCountColumn(error)) {
      return failure(PAGE_COUNT_MIGRATION_MESSAGE);
    }
    return failure(error.message);
  }

  await syncBookTags(bookId, parseTagList(parsed.data.tags));
  revalidatePath(`/library/${bookId}`);
  revalidatePath("/library");
  return success("Книга обновлена");
}

export async function updateBookStatus(
  bookId: string,
  status: BookStatus,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("books")
    .update({
      status,
      finished_at: status === "finished" ? new Date().toISOString() : null,
    })
    .eq("id", bookId)
    .eq("user_id", user.id);

  if (error) {
    return failure(error.message);
  }

  revalidatePath(`/library/${bookId}`);
  revalidatePath("/library");
  return success("Статус обновлён");
}

export async function deleteBook(bookId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("books")
    .delete()
    .eq("id", bookId)
    .eq("user_id", user.id);

  if (error) {
    return failure(error.message);
  }

  revalidatePath("/library");
  redirect("/library");
}
