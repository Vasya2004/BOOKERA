import type { Book, Note, Tag } from "@/types/domain";
import type { BookStatus, NoteType } from "@/types/database";

type TagRelation = { tags: TagRow | TagRow[] | null };
type TagRow = { id: string; name: string; color: string | null };

export type BookRow = {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  isbn: string | null;
  published_year: number | null;
  page_count: number | null;
  description: string | null;
  status: BookStatus;
  personal_rating: number | null;
  finished_at: string | null;
  main_takeaway: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
  notes?: { count: number }[];
  book_tags?: TagRelation[];
};

export type NoteRow = {
  id: string;
  book_id: string;
  type: NoteType;
  content: string;
  page_number: number | null;
  chapter_number: number | null;
  chapter_title: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  note_tags?: TagRelation[];
  books?: {
    id: string;
    title: string;
    author: string | null;
    cover_url: string | null;
  } | null;
};

export function mapTags(relations: TagRelation[] | undefined): Tag[] {
  return (relations ?? [])
    .flatMap((relation) =>
      Array.isArray(relation.tags) ? relation.tags : relation.tags ? [relation.tags] : [],
    )
    .map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
    }));
}

export function mapBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    coverUrl: row.cover_url,
    isbn: row.isbn,
    publishedYear: row.published_year,
    pageCount: row.page_count,
    description: row.description,
    status: row.status,
    personalRating: row.personal_rating,
    finishedAt: row.finished_at,
    mainTakeaway: row.main_takeaway,
    summary: row.summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: mapTags(row.book_tags),
    notesCount: row.notes?.[0]?.count ?? 0,
  };
}

export function mapNote(row: NoteRow): Note {
  return {
    id: row.id,
    bookId: row.book_id,
    type: row.type,
    content: row.content,
    pageNumber: row.page_number,
    chapterNumber: row.chapter_number,
    chapterTitle: row.chapter_title,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: mapTags(row.note_tags),
    book: row.books
      ? {
          id: row.books.id,
          title: row.books.title,
          author: row.books.author,
          coverUrl: row.books.cover_url,
        }
      : undefined,
  };
}
