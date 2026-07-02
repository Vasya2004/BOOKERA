import type { BookStatus, NoteType } from "@/types/database";

export type Tag = {
  id: string;
  name: string;
  color: string | null;
};

export type Book = {
  id: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  isbn: string | null;
  publishedYear: number | null;
  pageCount: number | null;
  description: string | null;
  status: BookStatus;
  personalRating: number | null;
  finishedAt: string | null;
  mainTakeaway: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  notesCount: number;
};

export type Note = {
  id: string;
  bookId: string;
  type: NoteType;
  content: string;
  pageNumber: number | null;
  chapterNumber: number | null;
  chapterTitle: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  book?: {
    id: string;
    title: string;
    author: string | null;
    coverUrl: string | null;
  };
};

export type DashboardStats = {
  finishedCount: number;
  finishedPagesCount: number;
  favoriteNotesCount: number;
  insightsCount: number;
};
