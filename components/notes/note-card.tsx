"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, MoreVertical, Pencil, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { deleteNote, toggleFavoriteNote, updateNote } from "@/server/actions/notes";
import { getChapterLabel } from "@/lib/notes/chapters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState(note.content);
  const [chapterTitle, setChapterTitle] = useState(note.chapterTitle ?? "");
  const [favorite, setFavorite] = useState(note.isFavorite);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current?.contains(event.target as Node)) {
        return;
      }
      setMenuOpen(false);
    }

    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", handlePointerDown, true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [menuOpen]);

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

  if (editing) {
    return (
      <article className="space-y-2 rounded-md border border-border bg-card p-2.5">
        <Input
          value={chapterTitle}
          onChange={(event) => setChapterTitle(event.target.value)}
          placeholder="Название главы"
          className="h-8 text-xs"
        />
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-[72px] text-sm"
        />
        <div className="flex justify-end gap-1.5">
          <Button
            variant="secondary"
            className="h-8 px-2.5"
            onClick={() => {
              setContent(note.content);
              setChapterTitle(note.chapterTitle ?? "");
              setEditing(false);
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button
            disabled={pending}
            className="h-8 px-2.5"
            onClick={() => {
              const tags = note.tags.map((tag) => tag.name).join(", ");
              run(updateNote(note.id, note.bookId, content, chapterTitle, tags));
              setEditing(false);
            }}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative h-full w-full rounded-lg border border-border/70 bg-card p-3 pr-12 transition md:pr-10",
        menuOpen && "z-30",
        favorite && "border-[#dca64d]/45 bg-[#fff8ec]",
      )}
    >
      <div ref={menuRef} className="absolute right-0.5 top-0.5 z-10 md:right-1 md:top-1">
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "touch-manipulation rounded-full p-0 text-muted-foreground",
            "h-11 w-11 min-h-11 min-w-11",
            "opacity-100 md:h-8 md:w-8 md:min-h-8 md:min-w-8 md:opacity-70 md:group-hover:opacity-100",
            menuOpen && "bg-muted/80 opacity-100",
          )}
          aria-label="Действия с заметкой"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((open) => !open);
          }}
        >
          <MoreVertical className="h-5 w-5 md:h-4 md:w-4" />
        </Button>
        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-40 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              className="flex min-h-11 w-full touch-manipulation items-center gap-2.5 px-3 py-2.5 text-left text-sm active:bg-muted/70 md:min-h-0 md:py-2 md:hover:bg-muted/70"
              disabled={pending}
              onClick={() => {
                const next = !favorite;
                setFavorite(next);
                run(toggleFavoriteNote(note.id, note.bookId, next));
                setMenuOpen(false);
              }}
            >
              <Star className={cn("h-4 w-4 shrink-0", favorite && "fill-current text-[#b8781d]")} />
              {favorite ? "Убрать из избранного" : "В избранное"}
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex min-h-11 w-full touch-manipulation items-center gap-2.5 px-3 py-2.5 text-left text-sm active:bg-muted/70 md:min-h-0 md:py-2 md:hover:bg-muted/70"
              onClick={() => {
                setEditing(true);
                setMenuOpen(false);
              }}
            >
              <Pencil className="h-4 w-4 shrink-0" />
              Редактировать
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex min-h-11 w-full touch-manipulation items-center gap-2.5 px-3 py-2.5 text-left text-sm text-destructive active:bg-destructive/10 md:min-h-0 md:py-2 md:hover:bg-destructive/10"
              disabled={pending}
              onClick={() => {
                run(deleteNote(note.id, note.bookId));
                setMenuOpen(false);
              }}
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              Удалить
            </button>
          </div>
        ) : null}
      </div>

      <p className="whitespace-pre-wrap break-words text-sm leading-5 text-foreground">
        {note.content}
      </p>

      {showBook && note.book ? (
        <Link
          href={`/library/${note.book.id}`}
          className="mt-1.5 block truncate text-[11px] font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          {note.book.title}
        </Link>
      ) : !compact ? (
        <p className="mt-1.5 truncate text-[11px] text-muted-foreground">{getChapterLabel(note)}</p>
      ) : null}
    </article>
  );
}
