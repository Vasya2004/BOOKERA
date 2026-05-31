import Image from "next/image";
import Link from "next/link";
import { BookOpen, Calendar, MessageSquare, Star } from "lucide-react";
import { BookStatusBadge } from "@/components/books/book-status-badge";
import { TagList } from "@/components/tags/tag-input";
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
    <Link href={`/library/${book.id}`}>
      <Card className="group overflow-hidden transition hover:-translate-y-0.5 hover:border-[#dca64d]/70 hover:shadow-[0_24px_70px_-46px_rgba(7,17,39,0.95)]">
        <div className="grid grid-cols-[104px_1fr] gap-0 sm:grid-cols-[128px_1fr]">
          <div className="relative min-h-40 bg-muted">
            <BookCover book={book} />
          </div>
          <div className="flex min-w-0 flex-col justify-between gap-4 p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-sm font-semibold leading-5 group-hover:underline">
                    {book.title}
                  </h2>
                  {book.author ? (
                    <p className="mt-1 truncate text-xs text-muted-foreground">{book.author}</p>
                  ) : null}
                </div>
                <BookStatusBadge status={book.status} />
              </div>
              <TagList tags={book.tags} compact />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5" />
                {book.personalRating ? `${book.personalRating}/10` : "-"}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {book.notesCount}
              </span>
              {book.pageCount ? (
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {book.pageCount}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Intl.DateTimeFormat("ru", { dateStyle: "medium" }).format(
                  new Date(book.createdAt),
                )}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
