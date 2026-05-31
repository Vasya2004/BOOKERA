import { z } from "zod";

export const bookStatusSchema = z.enum(["to_read", "reading", "finished"]);

export const noteTypeSchema = z.enum([
  "insight",
  "quote",
  "idea",
  "action",
  "question",
]);

export const bookFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(240),
  author: z.string().trim().max(160).optional().or(z.literal("")),
  coverUrl: z.string().trim().url().optional().or(z.literal("")),
  isbn: z.string().trim().max(32).optional().or(z.literal("")),
  publishedYear: z.coerce
    .number()
    .int()
    .min(0)
    .max(3000)
    .optional()
    .or(z.literal("")),
  pageCount: z.coerce
    .number()
    .int()
    .min(1)
    .max(10000)
    .optional()
    .or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  status: bookStatusSchema,
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
  bookId: z.string().uuid(),
  type: noteTypeSchema.default("insight"),
  content: z.string().trim().min(1, "Note cannot be empty").max(4000),
  pageNumber: z.coerce.number().int().positive().optional().or(z.literal("")),
  chapterNumber: z.coerce.number().int().min(1).max(20),
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
