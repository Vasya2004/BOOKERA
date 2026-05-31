"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Link2, Pencil, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { deleteNote, toggleFavoriteNote, updateNote } from "@/server/actions/notes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NoteTypeBadge } from "@/components/notes/note-type-badge";
import { cn } from "@/lib/utils/cn";
import type { Note } from "@/types/domain";

export function NoteCard({
  note,
  showBook = false,
  compact = false,
}: {
  note: Note;
  showBook?: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState(note.content);
  const [chapterNumber, setChapterNumber] = useState(note.chapterNumber?.toString() ?? "1");
  const [tags, setTags] = useState(note.tags.map((tag) => tag.name).join(", "));
  const [favorite, setFavorite] = useState(note.isFavorite);

  function run(result: Promise<{ ok: boolean; message?: string }>) {
    startTransition(async () => {
      const actionResult = await result;
      if (actionResult.ok) {
        toast.success(actionResult.message ?? "Готово");
        router.refresh();
      } else {
        toast.error(actionResult.message ?? "Ошибка");
      }
    });
  }

  return (
    <Card
      className={cn(
        compact ? "p-3" : "p-4",
        favorite
          ? "border-[#dca64d]/70 bg-gradient-to-br from-[#fff4d7] via-card to-card shadow-[0_12px_35px_-24px_rgba(220,166,77,0.9)]"
          : undefined,
      )}
    >
      {editing ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <select
              value={chapterNumber}
              onChange={(event) => setChapterNumber(event.target.value)}
              className="h-10 w-full rounded-md border border-border bg-[#fffdf8] px-3 text-sm text-foreground outline-none transition focus:border-[#dca64d] focus:ring-2 focus:ring-ring/65"
              aria-label="Глава"
            >
              {Array.from({ length: 20 }, (_, index) => index + 1).map((chapter) => (
                <option key={chapter} value={chapter}>
                  Глава {chapter}
                </option>
              ))}
            </select>
            <Input value={tags} onChange={(event) => setTags(event.target.value)} />
          </div>
          <Textarea value={content} onChange={(event) => setContent(event.target.value)} />
          <div className="flex flex-col justify-end gap-2 sm:flex-row">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setEditing(false)}
            >
              <X className="h-4 w-4" />
              Отмена
            </Button>
            <Button
              disabled={pending}
              className="w-full sm:w-auto"
              onClick={() => {
                run(updateNote(note.id, note.bookId, content, chapterNumber, tags));
                setEditing(false);
              }}
            >
              <Check className="h-4 w-4" />
              Сохранить
            </Button>
          </div>
        </div>
      ) : (
        <div className={cn(compact ? "space-y-2" : "space-y-3")}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <NoteTypeBadge type={note.type} />
                {note.chapterNumber ? (
                  <span className="inline-flex rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    гл. {note.chapterNumber}
                  </span>
                ) : null}
                {note.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex max-w-[180px] items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${tag.color ?? "#dca64d"}22`,
                      borderColor: `${tag.color ?? "#dca64d"}66`,
                      color: tag.color ?? "#17213a",
                    }}
                    title={tag.name}
                  >
                    <span className="truncate">{tag.name}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1">
              {showBook && note.book ? (
                <Link
                  href={`/library/${note.book.id}`}
                  aria-label="Открыть книгу"
                  className={cn(
                    "inline-flex items-center justify-center rounded-full text-foreground transition hover:bg-muted",
                    compact ? "h-8 min-w-12 px-3.5" : "h-9 min-w-14 px-4",
                  )}
                >
                  <Link2 className="h-4 w-4" />
                </Link>
              ) : null}
              <Button
                variant="ghost"
                className={cn(
                  compact ? "h-8 min-w-12 rounded-full px-3.5" : "h-9 min-w-14 rounded-full px-4",
                  favorite
                    ? "bg-[#fff0c7] text-[#b8781d] hover:bg-[#ffe6a7]"
                    : "text-muted-foreground",
                )}
                disabled={pending}
                onClick={() => {
                  const next = !favorite;
                  setFavorite(next);
                  run(toggleFavoriteNote(note.id, note.bookId, next));
                }}
              >
                <Star className={favorite ? "h-4 w-4 fill-current" : "h-4 w-4"} />
              </Button>
              <Button
                variant="ghost"
                className={compact ? "h-8 min-w-12 rounded-full px-3.5" : "h-9 min-w-14 rounded-full px-4"}
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  compact ? "h-8 min-w-12 rounded-full px-3.5" : "h-9 min-w-14 rounded-full px-4",
                  "text-destructive",
                )}
                disabled={pending}
                onClick={() => run(deleteNote(note.id, note.bookId))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className={cn("whitespace-pre-wrap text-sm", compact ? "line-clamp-2 leading-5" : "leading-6")}>
            {note.content}
          </p>
        </div>
      )}
    </Card>
  );
}
