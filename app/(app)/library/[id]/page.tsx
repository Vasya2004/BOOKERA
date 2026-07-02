import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookCover } from "@/components/books/book-card";
import { BookForm } from "@/components/books/book-form";
import { BookNotesPanel } from "@/components/books/book-notes-panel";
import { BookStatusBadge } from "@/components/books/book-status-badge";
import { DatabaseSetupCard } from "@/components/layout/database-setup-card";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { NotesPanelSkeleton } from "@/components/ui/page-skeleton";
import { deleteBook, updateBook } from "@/server/actions/books";
import { DatabaseSetupError, getBook } from "@/server/queries/books";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;
  let book;

  try {
    book = await getBook(id);
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

  return (
    <div className="w-full space-y-8 pb-4">
      <Link
        href="/library"
        prefetch
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        К библиотеке
      </Link>

      <header className="flex gap-4">
        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md bg-muted shadow-sm">
          <BookCover book={book} priority className="object-cover" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <BookStatusBadge status={book.status} />
            {book.personalRating ? (
              <span className="text-xs text-muted-foreground">{book.personalRating}/10</span>
            ) : null}
          </div>
          <h1 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
            {book.title}
          </h1>
          {book.author ? (
            <p className="text-sm text-muted-foreground">{book.author}</p>
          ) : null}
          {book.mainTakeaway ? (
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {book.mainTakeaway}
            </p>
          ) : null}
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Заметки</h2>
        <Suspense fallback={<NotesPanelSkeleton />}>
          <BookNotesPanel bookId={book.id} />
        </Suspense>
      </section>

      <details className="rounded-lg border border-border/80 bg-card/60">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground">
          Редактировать книгу
        </summary>
        <div className="border-t border-border/80 px-1 pb-1 pt-2">
          <div className="flex justify-end px-3 pb-2">
            <ConfirmDeleteDialog action={deleteAction} />
          </div>
          <BookForm book={book} action={updateAction} embedded />
        </div>
      </details>
    </div>
  );
}
