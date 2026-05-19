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
  showPodcast = false,
  compact = false,
}: {
  note: Note;
  showPodcast?: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState(note.content);
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
          ? "border-amber-200/70 bg-gradient-to-br from-amber-50/80 via-card to-card shadow-[0_6px_20px_-12px_rgba(217,119,6,0.45)]"
          : undefined,
      )}
    >
      {editing ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr]">
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
                run(updateNote(note.id, note.podcastId, note.type, content, "", tags));
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
                {note.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex max-w-[180px] items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${tag.color ?? "#64748b"}22`,
                      borderColor: `${tag.color ?? "#64748b"}66`,
                      color: tag.color ?? "#475569",
                    }}
                    title={tag.name}
                  >
                    <span className="truncate">{tag.name}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1">
              {showPodcast && note.podcast ? (
                <Link
                  href={`/podcasts/${note.podcast.id}`}
                  aria-label="Открыть подкаст"
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
                    ? "bg-amber-100/80 text-amber-600 hover:bg-amber-100"
                    : "text-muted-foreground",
                )}
                disabled={pending}
                onClick={() => {
                  const next = !favorite;
                  setFavorite(next);
                  run(toggleFavoriteNote(note.id, note.podcastId, next));
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
                onClick={() => run(deleteNote(note.id, note.podcastId))}
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
