"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { RatingSelect } from "@/components/books/rating-select";
import { TagInput } from "@/components/tags/tag-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import type { ActionResult } from "@/server/actions/result";
import type { Book } from "@/types/domain";

type BookFormProps = {
  book?: Book;
  action: (previousState: ActionResult, formData: FormData) => Promise<ActionResult>;
  embedded?: boolean;
};

const initialState: ActionResult = { ok: true };

export function BookForm({ book, action, embedded = false }: BookFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const form = (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="currentStatus" value={book?.status ?? ""} />
      <input type="hidden" name="summary" value={book?.summary ?? ""} />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Название</Label>
          <Input id="title" name="title" defaultValue={book?.title ?? ""} required />
          {!state.ok && state.fieldErrors?.title ? (
            <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="author">Автор</Label>
            <Input id="author" name="author" defaultValue={book?.author ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select
              id="status"
              name="status"
              defaultValue={book?.status ?? "to_read"}
              className="h-10"
            >
              <option value="to_read">В очереди</option>
              <option value="reading">Читаю</option>
              <option value="finished">Прочитана</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverFile">Обложка</Label>
          <Input
            id="coverFile"
            name="coverFile"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="pt-2 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary-foreground"
          />
          <Input
            id="coverUrl"
            name="coverUrl"
            type="url"
            defaultValue={book?.coverUrl ?? ""}
            placeholder="или вставьте ссылку на обложку"
            className="mt-2"
          />
        </div>

        <details className="rounded-md border border-border/70 bg-muted/30 px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Дополнительно
          </summary>
          <div className="mt-4 space-y-4 pb-2">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="publishedYear">Год</Label>
                <Input
                  id="publishedYear"
                  name="publishedYear"
                  type="number"
                  min={0}
                  max={3000}
                  defaultValue={book?.publishedYear ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pageCount">Страниц</Label>
                <Input
                  id="pageCount"
                  name="pageCount"
                  type="number"
                  min={1}
                  max={10000}
                  defaultValue={book?.pageCount ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Рейтинг</Label>
                <RatingSelect defaultValue={book?.personalRating} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Теги</Label>
              <TagInput defaultTags={book?.tags} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainTakeaway">Главный вывод</Label>
              <Textarea
                id="mainTakeaway"
                name="mainTakeaway"
                defaultValue={book?.mainTakeaway ?? ""}
                placeholder="Одна главная мысль из книги"
                className="min-h-20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={book?.description ?? ""}
                className="min-h-20"
              />
            </div>

            <input type="hidden" name="isbn" value={book?.isbn ?? ""} />
          </div>
        </details>
      </div>

      {!state.ok ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : state.message ? (
        <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="h-10 w-full sm:w-auto">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {book ? "Сохранить" : "Добавить книгу"}
      </Button>
    </form>
  );

  if (embedded) {
    return <div className={cn("px-3 pb-3")}>{form}</div>;
  }

  return <Card className="p-4 sm:p-5">{form}</Card>;
}
