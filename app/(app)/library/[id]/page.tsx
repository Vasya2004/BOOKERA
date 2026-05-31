import { notFound } from "next/navigation";
import { BookCover } from "@/components/books/book-card";
import { BookForm } from "@/components/books/book-form";
import { BookStatusBadge } from "@/components/books/book-status-badge";
import { DatabaseSetupCard } from "@/components/layout/database-setup-card";
import { NoteCard } from "@/components/notes/note-card";
import { NoteEditor } from "@/components/notes/note-editor";
import { TagList } from "@/components/tags/tag-input";
import { Card } from "@/components/ui/card";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteBook, updateBook } from "@/server/actions/books";
import { DatabaseSetupError, getBook, getBookNotes } from "@/server/queries/books";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BookDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  await searchParams;
  let book;
  let notes;

  try {
    [book, notes] = await Promise.all([
      getBook(id),
      getBookNotes(id, "all"),
    ]);
  } catch (error) {
    if (error instanceof DatabaseSetupError) {
      return <DatabaseSetupCard message={error.message} />;
    }
    throw error;
  }

  if (!book) {
    notFound();
  }

  const updateAction = updateBook.bind(null, book.id);
  const deleteAction = deleteBook.bind(null, book.id);
  const noteGroups = Array.from(
    notes.reduce((groups, note) => {
      const key = note.chapterNumber ?? 0;
      const items = groups.get(key) ?? [];
      items.push(note);
      groups.set(key, items);
      return groups;
    }, new Map<number, typeof notes>()),
  ).sort(([chapterA], [chapterB]) => {
    if (chapterA === 0) {
      return 1;
    }
    if (chapterB === 0) {
      return -1;
    }
    return chapterA - chapterB;
  });

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <div className="grid gap-0 sm:grid-cols-[156px_1fr] lg:grid-cols-[176px_1fr]">
            <div className="relative min-h-[220px] bg-muted sm:min-h-full">
              <BookCover book={book} priority />
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <BookStatusBadge status={book.status} />
                    {book.personalRating ? (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        {book.personalRating}/10
                      </span>
                    ) : null}
                    {book.publishedYear ? (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        {book.publishedYear}
                      </span>
                    ) : null}
                    {book.pageCount ? (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        {book.pageCount} стр.
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <h1 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">
                      {book.title}
                    </h1>
                    {book.author ? (
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {book.author}
                      </p>
                    ) : null}
                  </div>
                  <TagList tags={book.tags} />
                  {book.description ? (
                    <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {book.description}
                    </p>
                  ) : null}
                </div>
                <ConfirmDeleteDialog action={deleteAction} />
              </div>
              {book.mainTakeaway ? (
                <div className="mt-4 rounded-lg border border-border bg-muted/70 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Главный вывод
                  </p>
                  <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap text-sm leading-6">
                    {book.mainTakeaway}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </Card>

        <section className="space-y-4">
          <NoteEditor bookId={book.id} />
          <details className="rounded-lg border border-border bg-card p-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Метаданные и настройки
            </summary>
            <div className="mt-4 [&>div]:border-0 [&>div]:p-0 [&>div]:shadow-none">
              <BookForm book={book} action={updateAction} />
            </div>
          </details>
        </section>
      </div>

      <aside className="space-y-4 xl:pt-0">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Заметки</h2>
          {notes.length > 0 ? (
            <div className="space-y-5">
              {noteGroups.map(([chapter, chapterNotes]) => (
                <section key={chapter} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="shrink-0 text-sm font-semibold text-muted-foreground">
                      {chapter === 0 ? "Без главы" : `Глава ${chapter}`}
                    </h3>
                    <div className="h-px flex-1 bg-border/75" />
                    <span className="text-xs text-muted-foreground">
                      {chapterNotes.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {chapterNotes.map((note) => (
                      <NoteCard key={note.id} note={note} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Заметок пока нет"
              description="Пишите инсайты, цитаты и действия по ходу чтения."
            />
          )}
        </section>
      </aside>
    </div>
  );
}
