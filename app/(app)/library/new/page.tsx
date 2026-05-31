import { BookForm } from "@/components/books/book-form";
import { createBook } from "@/server/actions/books";

export default function NewBookPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Добавить книгу
      </h1>
      <BookForm action={createBook} />
    </div>
  );
}
