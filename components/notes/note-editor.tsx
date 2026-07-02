"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createNote } from "@/server/actions/notes";
import { ChapterPicker } from "@/components/notes/chapter-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/server/actions/result";

const initialState: ActionResult = { ok: true };

export function NoteEditor({
  bookId,
  chapterTitles = [],
}: {
  bookId: string;
  chapterTitles?: string[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createNote, initialState);

  useEffect(() => {
    if (state.ok && state.message) {
      const content = formRef.current?.querySelector<HTMLTextAreaElement>(
        'textarea[name="content"]',
      );
      if (content) {
        content.value = "";
      }
      router.refresh();
    }
  }, [router, state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-lg border border-border/80 bg-card/70 p-4">
      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="type" value="insight" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,300px)_1fr]">
        <ChapterPicker bookId={bookId} chapters={chapterTitles} />
        <div className="space-y-1.5">
          <Label htmlFor={`${bookId}-content`} className="text-xs">
            Заметка
          </Label>
          <Textarea
            id={`${bookId}-content`}
            name="content"
            placeholder="Короткая мысль по главе..."
            className="min-h-[72px] resize-y"
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {!state.ok ? (
          <p className="text-sm text-destructive">{state.message}</p>
        ) : (
          <span className="hidden sm:block" />
        )}
        <Button type="submit" disabled={pending} className="h-9 w-full sm:w-auto">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Добавить
        </Button>
      </div>
    </form>
  );
}
