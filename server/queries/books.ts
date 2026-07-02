import { requireUser } from "@/server/actions/auth-helpers";
import { mapBook, mapNote, type BookRow, type NoteRow } from "@/server/queries/mappers";
import type { Book, Note, Tag } from "@/types/domain";
import type { BookStatus, NoteType } from "@/types/database";

export class DatabaseSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseSetupError";
  }
}

function throwQueryError(error: { message: string; code?: string }) {
  if (
    error.message.includes("schema cache") ||
    error.message.includes("Could not find the table") ||
    error.message.includes("does not exist") ||
    error.message.includes("relation") ||
    error.code === "PGRST204" ||
    error.code === "PGRST205"
  ) {
    throw new DatabaseSetupError(
      "Схема Bookera ещё не создана или устарела в Supabase. Выполните миграции из supabase/migrations в SQL Editor.",
    );
  }

  throw new Error(error.message);
}

function isMissingPageCountColumn(error: { message: string; code?: string }) {
  return (
    error.message.includes("page_count") &&
    (error.message.includes("does not exist") ||
      error.message.includes("schema cache") ||
      error.code === "PGRST204")
  );
}

function isMissingChapterNumberColumn(error: { message: string; code?: string }) {
  return (
    error.message.includes("chapter_number") &&
    (error.message.includes("does not exist") ||
      error.message.includes("schema cache") ||
      error.code === "PGRST204")
  );
}

export type BookFilters = {
  q?: string;
  status?: BookStatus | "all";
  tag?: string;
  sort?: "new" | "finished" | "rating" | "updated";
};

const bookSelect = `
  id,
  title,
  author,
  cover_url,
  isbn,
  published_year,
  page_count,
  description,
  status,
  personal_rating,
  finished_at,
  main_takeaway,
  summary,
  created_at,
  updated_at,
  notes(count),
  book_tags(tags(id, name, color))
`;

const legacyBookSelect = `
  id,
  title,
  author,
  cover_url,
  isbn,
  published_year,
  description,
  status,
  personal_rating,
  finished_at,
  main_takeaway,
  summary,
  created_at,
  updated_at,
  notes(count),
  book_tags(tags(id, name, color))
`;

type SupabaseServerClient = Awaited<ReturnType<typeof requireUser>>["supabase"];

function escapeFilterValue(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll(",", "\\,");
}

function addMissingPageCount(rows: unknown[] | null) {
  return (rows ?? []).map((row) => ({
    ...(row as Record<string, unknown>),
    page_count: null,
  })) as unknown as BookRow[];
}

function isMissingChapterTitleColumn(error: { message: string; code?: string }) {
  return (
    error.message.includes("chapter_title") &&
    (error.message.includes("does not exist") ||
      error.message.includes("schema cache") ||
      error.code === "PGRST204")
  );
}

function addMissingChapterNumber(rows: unknown[] | null) {
  return (rows ?? []).map((row) => ({
    ...(row as Record<string, unknown>),
    chapter_number: null,
    chapter_title: (row as Record<string, unknown>).chapter_title ?? null,
  })) as unknown as NoteRow[];
}

function addMissingChapterTitle(rows: unknown[] | null) {
  return (rows ?? []).map((row) => ({
    ...(row as Record<string, unknown>),
    chapter_title: null,
  })) as unknown as NoteRow[];
}

function buildBooksQuery(
  supabase: SupabaseServerClient,
  userId: string,
  filters: BookFilters,
  select: string,
) {
  let query = supabase
    .from("books")
    .select(select)
    .eq("user_id", userId);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.q) {
    const q = escapeFilterValue(filters.q);
    query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%,description.ilike.%${q}%`);
  }

  switch (filters.sort ?? "new") {
    case "finished":
      query = query.order("finished_at", { ascending: false, nullsFirst: false });
      break;
    case "rating":
      query = query.order("personal_rating", { ascending: false, nullsFirst: false });
      break;
    case "updated":
      query = query.order("updated_at", { ascending: false });
      break;
    case "new":
      query = query.order("created_at", { ascending: false });
      break;
  }

  return query;
}

export async function getBooks(filters: BookFilters = {}): Promise<Book[]> {
  const { supabase, user } = await requireUser();
  let { data, error } = await buildBooksQuery(supabase, user.id, filters, bookSelect);
  let rows = data as unknown as BookRow[] | null;

  if (error && isMissingPageCountColumn(error)) {
    const legacy = await buildBooksQuery(supabase, user.id, filters, legacyBookSelect);
    data = legacy.data;
    error = legacy.error;
    rows = addMissingPageCount(data as unknown[] | null);
  }

  if (error) {
    throwQueryError(error);
  }

  const books = (rows ?? []).map(mapBook);
  if (!filters.tag || filters.tag === "all") {
    return books;
  }

  return books.filter((book) =>
    book.tags.some((tag) => tag.id === filters.tag || tag.name === filters.tag),
  );
}

export async function getBook(id: string): Promise<Book | null> {
  const { supabase, user } = await requireUser();
  const { data, error: initialError } = await supabase
    .from("books")
    .select(bookSelect)
    .eq("user_id", user.id)
    .eq("id", id)
    .maybeSingle();
  let error = initialError;
  let row = data as unknown as BookRow | null;

  if (error && isMissingPageCountColumn(error)) {
    const legacy = await supabase
      .from("books")
      .select(legacyBookSelect)
      .eq("user_id", user.id)
      .eq("id", id)
      .maybeSingle();
    error = legacy.error;
    row = legacy.data ? addMissingPageCount([legacy.data])[0] : null;
  }

  if (error) {
    throwQueryError(error);
  }

  return row ? mapBook(row) : null;
}

export async function getBookNotes(
  bookId: string,
  type?: NoteType | "all",
): Promise<Note[]> {
  const { supabase, user } = await requireUser();
  let query = supabase
    .from("notes")
    .select(
      `
        id,
        book_id,
        type,
        content,
        page_number,
        chapter_number,
        chapter_title,
        is_favorite,
        created_at,
        updated_at,
        note_tags(tags(id, name, color))
      `,
    )
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .order("chapter_number", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  const { data, error: initialError } = await query;
  let error = initialError;
  let rows = data as unknown as NoteRow[] | null;

  if (error && isMissingChapterTitleColumn(error)) {
    let legacyQuery = supabase
      .from("notes")
      .select(
        `
          id,
          book_id,
          type,
          content,
          page_number,
          chapter_number,
          is_favorite,
          created_at,
          updated_at,
          note_tags(tags(id, name, color))
        `,
      )
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .order("chapter_number", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (type && type !== "all") {
      legacyQuery = legacyQuery.eq("type", type);
    }

    const legacy = await legacyQuery;
    error = legacy.error;
    rows = addMissingChapterTitle(legacy.data as unknown[] | null);
  } else if (error && isMissingChapterNumberColumn(error)) {
    let legacyQuery = supabase
      .from("notes")
      .select(
        `
          id,
          book_id,
          type,
          content,
          page_number,
          is_favorite,
          created_at,
          updated_at,
          note_tags(tags(id, name, color))
        `,
      )
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .order("created_at", { ascending: false });

    if (type && type !== "all") {
      legacyQuery = legacyQuery.eq("type", type);
    }

    const legacy = await legacyQuery;
    error = legacy.error;
    rows = addMissingChapterNumber(legacy.data as unknown[] | null);
  }

  if (error) {
    throwQueryError(error);
  }

  return (rows ?? []).map(mapNote);
}

export async function getInsights(filters: {
  q?: string;
  type?: NoteType | "all";
  tag?: string;
  favorite?: boolean;
}): Promise<Note[]> {
  const { supabase, user } = await requireUser();
  let query = supabase
    .from("notes")
    .select(
      `
        id,
        book_id,
        type,
        content,
        page_number,
        chapter_number,
        chapter_title,
        is_favorite,
        created_at,
        updated_at,
        note_tags(tags(id, name, color)),
        books(id, title, author, cover_url)
      `,
    )
    .eq("user_id", user.id)
    .in("type", ["insight", "quote", "idea", "action", "question"])
    .order("created_at", { ascending: false });

  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters.favorite) {
    query = query.eq("is_favorite", true);
  }

  if (filters.q) {
    query = query.ilike("content", `%${filters.q}%`);
  }

  const { data, error: initialError } = await query;
  let error = initialError;
  let rows = data as unknown as NoteRow[] | null;

  if (error && isMissingChapterTitleColumn(error)) {
    let legacyQuery = supabase
      .from("notes")
      .select(
        `
          id,
          book_id,
          type,
          content,
          page_number,
          chapter_number,
          is_favorite,
          created_at,
          updated_at,
          note_tags(tags(id, name, color)),
          books(id, title, author, cover_url)
        `,
      )
      .eq("user_id", user.id)
      .in("type", ["insight", "quote", "idea", "action", "question"])
      .order("created_at", { ascending: false });

    if (filters.type && filters.type !== "all") {
      legacyQuery = legacyQuery.eq("type", filters.type);
    }

    if (filters.favorite) {
      legacyQuery = legacyQuery.eq("is_favorite", true);
    }

    if (filters.q) {
      legacyQuery = legacyQuery.ilike("content", `%${filters.q}%`);
    }

    const legacy = await legacyQuery;
    error = legacy.error;
    rows = addMissingChapterTitle(legacy.data as unknown[] | null);
  } else if (error && isMissingChapterNumberColumn(error)) {
    let legacyQuery = supabase
      .from("notes")
      .select(
        `
          id,
          book_id,
          type,
          content,
          page_number,
          is_favorite,
          created_at,
          updated_at,
          note_tags(tags(id, name, color)),
          books(id, title, author, cover_url)
        `,
      )
      .eq("user_id", user.id)
      .in("type", ["insight", "quote", "idea", "action", "question"])
      .order("created_at", { ascending: false });

    if (filters.type && filters.type !== "all") {
      legacyQuery = legacyQuery.eq("type", filters.type);
    }

    if (filters.favorite) {
      legacyQuery = legacyQuery.eq("is_favorite", true);
    }

    if (filters.q) {
      legacyQuery = legacyQuery.ilike("content", `%${filters.q}%`);
    }

    const legacy = await legacyQuery;
    error = legacy.error;
    rows = addMissingChapterNumber(legacy.data as unknown[] | null);
  }

  if (error) {
    throwQueryError(error);
  }

  const notes = (rows ?? []).map(mapNote);
  if (!filters.tag || filters.tag === "all") {
    return notes;
  }

  return notes.filter((note) =>
    note.tags.some((tag) => tag.id === filters.tag || tag.name === filters.tag),
  );
}

export async function getTags(): Promise<Tag[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, color")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    throwQueryError(error);
  }

  return (data ?? []).map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
  }));
}

export async function getDashboardData() {
  const [books, insights] = await Promise.all([
    getBooks({ sort: "new" }),
    getInsights({ favorite: false }),
  ]);
  const finishedBooks = books.filter((book) => book.status === "finished");

  return {
    stats: {
      finishedCount: finishedBooks.length,
      finishedPagesCount: finishedBooks.reduce(
        (total, book) => total + (book.pageCount ?? 0),
        0,
      ),
      favoriteNotesCount: insights.filter((note) => note.isFavorite).length,
      insightsCount: insights.length,
    },
    recentBooks: books.slice(0, 4),
    favoriteInsights: insights.filter((note) => note.isFavorite).slice(0, 5),
  };
}
