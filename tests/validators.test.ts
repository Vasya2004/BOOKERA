import { describe, expect, it } from "vitest";
import {
  noteFormSchema,
  parseTagList,
  podcastFormSchema,
} from "@/lib/validators/podcast";

describe("podcastFormSchema", () => {
  it("accepts a valid podcast payload", () => {
    const result = podcastFormSchema.safeParse({
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "A useful podcast",
      channelTitle: "Channel",
      status: "watched",
      personalRating: "9",
      tags: "strategy, product",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid YouTube URLs and ratings", () => {
    const result = podcastFormSchema.safeParse({
      youtubeUrl: "https://example.com/video",
      title: "A useful podcast",
      status: "watched",
      personalRating: "11",
    });

    expect(result.success).toBe(false);
  });
});

describe("noteFormSchema", () => {
  it("accepts supported note types", () => {
    const result = noteFormSchema.safeParse({
      podcastId: "00000000-0000-4000-8000-000000000000",
      type: "insight",
      content: "This changes how I think about distribution.",
      timestamp: "10:22",
      tags: "growth",
    });

    expect(result.success).toBe(true);
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
