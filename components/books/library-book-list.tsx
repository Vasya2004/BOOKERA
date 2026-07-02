"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookCard } from "@/components/books/book-card";
import type { Book } from "@/types/domain";

export function LibraryBookList({ books }: { books: Book[] }) {
  const router = useRouter();

  useEffect(() => {
    for (const book of books.slice(0, 10)) {
      router.prefetch(`/library/${book.id}`);
    }
  }, [books, router]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
