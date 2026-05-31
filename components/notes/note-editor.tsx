"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { createNote } from "@/server/actions/notes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/server/actions/result";

const initialState: ActionResult = { ok: true };

export function NoteEditor({ bookId }: { bookId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createNote, initialState);

  useEffect(() => {
    if (state.ok && state.message) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state]);

  return (
    <Card className="rounded-xl p-3.5 sm:p-4">
      <form ref={formRef} action={formAction} className="space-y-3">
        <input type="hidden" name="bookId" value={bookId} />
        <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
          <div className="space-y-2">
            <Label htmlFor="chapterNumber">Глава</Label>
            <Select
              id="chapterNumber"
              name="chapterNumber"
              defaultValue="1"
              className="h-11 sm:h-10"
            >
              {Array.from({ length: 20 }, (_, index) => index + 1).map((chapter) => (
                <option key={chapter} value={chapter}>
                  Глава {chapter}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Теги заметки</Label>
            <Input id="tags" name="tags" placeholder="память, стратегия" />
          </div>
        </div>
        <Textarea
          name="content"
          placeholder="Запишите инсайт, цитату или вопрос по ходу чтения..."
          className="min-h-28"
          required
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" name="isFavorite" className="h-4 w-4" />
            В избранное
          </label>
          <Button type="submit" disabled={pending} className="h-11 w-full sm:h-10 sm:w-auto">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Сохранить
          </Button>
        </div>
        {!state.ok ? (
          <p className="text-sm text-destructive">{state.message}</p>
        ) : state.message ? (
          <p className="text-sm text-muted-foreground">{state.message}</p>
        ) : null}
      </form>
    </Card>
  );
}
