import type { Note } from "@/types/domain";

export const NO_CHAPTER_LABEL = "Без главы";

export function normalizeChapterTitle(value: string | undefined | null) {
  if (!value?.trim()) {
    return null;
  }
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeChapterKey(label: string) {
  if (label === NO_CHAPTER_LABEL) {
    return NO_CHAPTER_LABEL;
  }
  return normalizeChapterTitle(label)!.toLocaleLowerCase("ru");
}

export function getChapterLabel(note: Note) {
  const title = normalizeChapterTitle(note.chapterTitle);
  if (title) {
    return title;
  }
  if (note.chapterNumber) {
    return `Глава ${note.chapterNumber}`;
  }
  return NO_CHAPTER_LABEL;
}

export function collectChapterTitles(notes: Note[]) {
  const chapters = new Map<string, { title: string; firstAt: number }>();

  for (const note of notes) {
    const title = normalizeChapterTitle(note.chapterTitle);
    if (!title) {
      continue;
    }

    const key = normalizeChapterKey(title);
    const createdAt = new Date(note.createdAt).getTime();
    const existing = chapters.get(key);

    if (!existing || createdAt < existing.firstAt) {
      chapters.set(key, { title, firstAt: createdAt });
    }
  }

  return Array.from(chapters.values())
    .sort((a, b) => a.firstAt - b.firstAt)
    .map((chapter) => chapter.title);
}

export function groupNotesByChapter(notes: Note[]) {
  const groups = new Map<string, { label: string; notes: Note[]; firstAt: number }>();

  for (const note of notes) {
    const label = getChapterLabel(note);
    const key = normalizeChapterKey(label);
    const createdAt = new Date(note.createdAt).getTime();
    const existing = groups.get(key);

    if (existing) {
      existing.notes.push(note);
      existing.firstAt = Math.min(existing.firstAt, createdAt);
      continue;
    }

    groups.set(key, { label, notes: [note], firstAt: createdAt });
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      notes: group.notes.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    }))
    .sort((a, b) => {
      if (a.label === NO_CHAPTER_LABEL) {
        return 1;
      }
      if (b.label === NO_CHAPTER_LABEL) {
        return -1;
      }
      return a.firstAt - b.firstAt;
    });
}
