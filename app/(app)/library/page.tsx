import Link from "next/link";
import { LibraryBookList } from "@/components/books/library-book-list";
import { DatabaseSetupCard } from "@/components/layout/database-setup-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { DatabaseSetupError, getBooks } from "@/server/queries/books";
import type { BookStatus } from "@/types/database";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LibraryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = getParam(params.q);
  const status = getParam(params.status) as BookStatus | "all" | undefined;
  let books;

  try {
    books = await getBooks({ q, status, sort: "new" });
  } catch (error) {
    if (error instanceof DatabaseSetupError) {
      return <DatabaseSetupCard message={error.message} />;
    }
    throw error;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Библиотека</h1>
        <Link href="/library/new" className="sm:shrink-0">
          <Button className="h-10 w-full sm:w-auto">Добавить книгу</Button>
        </Link>
      </div>

      <form className="flex flex-col gap-2.5 sm:flex-row">
        <div className="flex-1">
          <SearchInput defaultValue={q} placeholder="Поиск по названию или автору" />
        </div>
        <Select name="status" defaultValue={status ?? "all"} className="h-11 sm:h-10 sm:w-44">
          <option value="all">Все</option>
          <option value="to_read">В очереди</option>
          <option value="reading">Читаю</option>
          <option value="finished">Прочитана</option>
        </Select>
        <Button type="submit" className="h-11 sm:h-10 sm:px-5">
          Найти
        </Button>
      </form>

      {books.length > 0 ? (
        <LibraryBookList books={books} />
      ) : (
        <EmptyState
          title="Книги не найдены"
          description="Измените поиск или добавьте первую книгу."
          action={
            <Link href="/library/new">
              <Button>Добавить книгу</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
