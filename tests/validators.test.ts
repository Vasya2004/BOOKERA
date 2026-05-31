import { describe, expect, it } from "vitest";
import {
  bookFormSchema,
  noteFormSchema,
  parseTagList,
} from "@/lib/validators/book";

describe("bookFormSchema", () => {
  it("accepts a valid book payload", () => {
    const result = bookFormSchema.safeParse({
      title: "A useful book",
      author: "Author",
      coverUrl: "https://example.com/cover.jpg",
      isbn: "978-0-00-000000-0",
      publishedYear: "2024",
      pageCount: "320",
      status: "finished",
      personalRating: "9",
      tags: "strategy, reading",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing titles, invalid cover URLs, ratings and page counts", () => {
    const result = bookFormSchema.safeParse({
      title: "",
      coverUrl: "not-a-url",
      status: "finished",
      personalRating: "11",
      pageCount: "0",
    });

    expect(result.success).toBe(false);
  });
});

describe("noteFormSchema", () => {
  it("accepts default insight notes with chapter numbers", () => {
    const result = noteFormSchema.safeParse({
      bookId: "00000000-0000-4000-8000-000000000000",
      content: "This changes how I think about distribution.",
      chapterNumber: "12",
      tags: "growth",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid chapter numbers", () => {
    const result = noteFormSchema.safeParse({
      bookId: "00000000-0000-4000-8000-000000000000",
      content: "This changes how I think about distribution.",
      chapterNumber: "21",
    });

    expect(result.success).toBe(false);
  });
});

describe("parseTagList", () => {
  it("normalizes and de-duplicates tags", () => {
    expect(parseTagList("AI, ai, product strategy,  ")).toEqual([
      "AI",
      "product strategy",
    ]);
  });
});
