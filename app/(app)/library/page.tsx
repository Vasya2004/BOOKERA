import Link from "next/link";
import { BookCard } from "@/components/books/book-card";
import { DatabaseSetupCard } from "@/components/layout/database-setup-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { DatabaseSetupError, getBooks, getTags } from "@/server/queries/books";
import type { BookStatus } from "@/types/database";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LibraryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = getParam(params.q);
  const status = getParam(params.status) as BookStatus | "all" | undefined;
  const tag = getParam(params.tag);
  const sort = getParam(params.sort) as "new" | "finished" | "rating" | "updated" | undefined;
  let books;
  let tags;

  try {
    [books, tags] = await Promise.all([
      getBooks({ q, status, tag, sort }),
      getTags(),
    ]);
  } catch (error) {
    if (error instanceof DatabaseSetupError) {
      return <DatabaseSetupCard message={error.message} />;
    }
    throw error;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Библиотека
        </h1>
        <Link href="/library/new" className="sm:shrink-0">
          <Button className="h-11 w-full sm:h-10 sm:w-auto">Добавить книгу</Button>
        </Link>
      </div>

      <form className="grid gap-2.5 rounded-lg border border-border bg-card p-3 sm:gap-3 md:grid-cols-[1fr_170px_180px_170px_auto]">
        <SearchInput defaultValue={q} placeholder="Название, автор или описание" />
        <Select name="status" defaultValue={status ?? "all"} className="h-11 md:h-10">
          <option value="all">Все статусы</option>
          <option value="to_read">В очереди</option>
          <option value="reading">Читаю</option>
          <option value="finished">Прочитана</option>
        </Select>
        <Select name="tag" defaultValue={tag ?? "all"} className="h-11 md:h-10">
          <option value="all">Все теги</option>
          {tags.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select name="sort" defaultValue={sort ?? "new"} className="h-11 md:h-10">
          <option value="new">Новые</option>
          <option value="finished">Недавно прочитанные</option>
          <option value="rating">Высокий рейтинг</option>
          <option value="updated">Недавно обновлённые</option>
        </Select>
        <Button type="submit" className="h-11 w-full md:h-10">
          Поиск
        </Button>
      </form>

      {books.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Книги не найдены"
          description="Измените фильтры или добавьте первую книгу в библиотеку."
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
