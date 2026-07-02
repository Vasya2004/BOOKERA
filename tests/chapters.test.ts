import { describe, expect, it } from "vitest";
import {
  collectChapterTitles,
  groupNotesByChapter,
  normalizeChapterTitle,
} from "@/lib/notes/chapters";
import type { Note } from "@/types/domain";

function makeNote(overrides: Partial<Note> & Pick<Note, "id" | "createdAt">): Note {
  return {
    bookId: "book-1",
    type: "insight",
    content: "text",
    pageNumber: null,
    chapterNumber: null,
    chapterTitle: null,
    isFavorite: false,
    updatedAt: overrides.createdAt,
    tags: [],
    ...overrides,
  };
}

describe("chapter helpers", () => {
  it("merges chapter titles with different spacing and case", () => {
    const notes = [
      makeNote({
        id: "1",
        chapterTitle: "Глава 1 - Самоуверен",
        createdAt: "2026-01-01T10:00:00.000Z",
      }),
      makeNote({
        id: "2",
        chapterTitle: "глава 1 -  самоуверен",
        createdAt: "2026-01-02T10:00:00.000Z",
      }),
    ];

    const groups = groupNotesByChapter(notes);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.notes).toHaveLength(2);
    expect(groups[0]?.label).toBe("Глава 1 - Самоуверен");
  });

  it("orders chapters by the first added note", () => {
    const notes = [
      makeNote({
        id: "1",
        chapterTitle: "Вторая",
        createdAt: "2026-01-03T10:00:00.000Z",
      }),
      makeNote({
        id: "2",
        chapterTitle: "Первая",
        createdAt: "2026-01-01T10:00:00.000Z",
      }),
      makeNote({
        id: "3",
        chapterTitle: "Первая",
        createdAt: "2026-01-02T10:00:00.000Z",
      }),
    ];

    const groups = groupNotesByChapter(notes);
    expect(groups.map((group) => group.label)).toEqual(["Первая", "Вторая"]);
  });

  it("returns chapter titles in first-added order", () => {
    const notes = [
      makeNote({
        id: "1",
        chapterTitle: "Глава 2",
        createdAt: "2026-01-02T10:00:00.000Z",
      }),
      makeNote({
        id: "2",
        chapterTitle: "Глава 1",
        createdAt: "2026-01-01T10:00:00.000Z",
      }),
    ];

    expect(collectChapterTitles(notes)).toEqual(["Глава 1", "Глава 2"]);
  });

  it("normalizes whitespace in chapter titles", () => {
    expect(normalizeChapterTitle("  Глава   1  ")).toBe("Глава 1");
  });
});
