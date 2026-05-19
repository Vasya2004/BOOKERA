import { describe, expect, it } from "vitest";
import {
  extractYouTubeVideoId,
  parseTimestampToSeconds,
  parseYouTubeDurationToSeconds,
} from "@/lib/youtube/utils";

describe("extractYouTubeVideoId", () => {
  it("supports youtube.com watch URLs", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("supports youtu.be URLs", () => {
    expect(extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ?t=12")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("supports embed and shorts URLs", () => {
    expect(extractYouTubeVideoId("https://youtube.com/embed/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
    expect(extractYouTubeVideoId("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("rejects invalid URLs", () => {
    expect(extractYouTubeVideoId("https://example.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(extractYouTubeVideoId("not a url")).toBeNull();
  });
});

describe("parseYouTubeDurationToSeconds", () => {
  it("parses ISO 8601 durations", () => {
    expect(parseYouTubeDurationToSeconds("PT1H2M3S")).toBe(3723);
    expect(parseYouTubeDurationToSeconds("PT15M")).toBe(900);
    expect(parseYouTubeDurationToSeconds("PT45S")).toBe(45);
    expect(parseYouTubeDurationToSeconds("P1DT2H")).toBe(93600);
  });

  it("throws on invalid durations", () => {
    expect(() => parseYouTubeDurationToSeconds("1:23")).toThrow();
  });
});

describe("parseTimestampToSeconds", () => {
  it("supports seconds, mm:ss and hh:mm:ss", () => {
    expect(parseTimestampToSeconds("90")).toBe(90);
    expect(parseTimestampToSeconds("12:34")).toBe(754);
    expect(parseTimestampToSeconds("1:02:03")).toBe(3723);
  });
});
