import { z } from "zod";
import { extractYouTubeVideoId } from "@/lib/youtube/utils";

export const podcastStatusSchema = z.enum([
  "want_to_watch",
  "watching",
  "watched",
]);

export const noteTypeSchema = z.enum([
  "thought",
  "insight",
  "quote",
  "action",
  "question",
  "idea",
]);

export const podcastFormSchema = z.object({
  youtubeUrl: z
    .string()
    .trim()
    .min(1, "YouTube URL is required")
    .refine((value) => Boolean(extractYouTubeVideoId(value)), {
      message: "Paste a valid YouTube URL",
    }),
  title: z.string().trim().min(1, "Title is required").max(240),
  channelTitle: z.string().trim().max(160).optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  thumbnailUrl: z.string().trim().url().optional().or(z.literal("")),
  durationSeconds: z.coerce.number().int().positive().optional().or(z.literal("")),
  publishedAt: z.string().trim().optional().or(z.literal("")),
  status: podcastStatusSchema,
  personalRating: z.coerce
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .or(z.literal("")),
  mainTakeaway: z.string().trim().max(2000).optional().or(z.literal("")),
  summary: z.string().trim().max(6000).optional().or(z.literal("")),
  tags: z.string().trim().optional().or(z.literal("")),
});

export const noteFormSchema = z.object({
  podcastId: z.string().uuid(),
  type: noteTypeSchema,
  content: z.string().trim().min(1, "Note cannot be empty").max(4000),
  timestamp: z.string().trim().optional().or(z.literal("")),
  isFavorite: z.coerce.boolean().optional(),
  tags: z.string().trim().optional().or(z.literal("")),
});

export const profileFormSchema = z.object({
  fullName: z.string().trim().max(120).optional().or(z.literal("")),
  avatarUrl: z.string().trim().url().optional().or(z.literal("")),
});

export const tagNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .transform((value) => value.replace(/\s+/g, " "));

export function parseTagList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  const unique = new Map<string, string>();
  for (const tag of value.split(",")) {
    const parsed = tagNameSchema.safeParse(tag);
    if (parsed.success) {
      const key = parsed.data.toLowerCase();
      if (!unique.has(key)) {
        unique.set(key, parsed.data);
      }
    }
  }

  return Array.from(unique.values());
}
