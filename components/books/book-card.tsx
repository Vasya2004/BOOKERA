import Image from "next/image";
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import { BookStatusBadge } from "@/components/books/book-status-badge";
import { Card } from "@/components/ui/card";
import type { Book } from "@/types/domain";

export function BookCover({
  book,
  priority = false,
  className,
}: {
  book: Pick<Book, "title" | "author" | "coverUrl">;
  priority?: boolean;
  className?: string;
}) {
  if (book.coverUrl) {
    return (
      <Image
        src={book.coverUrl}
        alt=""
        fill
        sizes="(min-width: 1024px) 220px, 42vw"
        className={className ?? "object-cover"}
        unoptimized
        priority={priority}
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-[linear-gradient(145deg,#071127,#142b55_60%,#dca64d)] p-4 text-[#fff8ec]">
      <BookOpen className="h-7 w-7 opacity-80" />
      <div>
        <p className="line-clamp-4 text-lg font-semibold leading-tight">{book.title}</p>
        {book.author ? <p className="mt-2 line-clamp-2 text-xs opacity-75">{book.author}</p> : null}
      </div>
    </div>
  );
}

export function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/library/${book.id}`} className="block h-full w-full">
      <Card className="group h-full w-full overflow-hidden transition hover:border-[#dca64d]/60">
        <div className="flex h-full w-full gap-0">
          <div className="relative h-32 w-24 shrink-0 bg-muted sm:h-36 sm:w-32">
            <BookCover book={book} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="line-clamp-2 text-sm font-semibold leading-5 group-hover:underline">
                  {book.title}
                </h2>
                <BookStatusBadge status={book.status} className="shrink-0" />
              </div>
              {book.author ? (
                <p className="truncate text-xs text-muted-foreground">{book.author}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {book.personalRating ? (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" />
                  {book.personalRating}/10
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {book.notesCount} зам.
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
