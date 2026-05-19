import Link from "next/link";
import { PodcastCard } from "@/components/podcasts/podcast-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { getPodcasts, getTags } from "@/server/queries/podcasts";
import type { PodcastStatus } from "@/types/database";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PodcastsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = getParam(params.q);
  const status = getParam(params.status) as PodcastStatus | "all" | undefined;
  const tag = getParam(params.tag);
  const sort = getParam(params.sort) as "new" | "watched" | "rating" | "updated" | undefined;
  const [podcasts, tags] = await Promise.all([
    getPodcasts({ q, status, tag, sort }),
    getTags(),
  ]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Подкасты
        </h1>
        <Link href="/podcasts/new" className="sm:shrink-0">
          <Button className="h-11 w-full sm:h-10 sm:w-auto">Добавить подкаст</Button>
        </Link>
      </div>

      <form className="grid gap-2.5 rounded-xl border border-border bg-card p-3 sm:gap-3 md:grid-cols-[1fr_180px_180px_190px_auto]">
        <SearchInput defaultValue={q} placeholder="Название, канал или описание" />
        <Select name="status" defaultValue={status ?? "all"} className="h-11 md:h-10">
          <option value="all">Все статусы</option>
          <option value="want_to_watch">В планах</option>
          <option value="watching">Смотрю</option>
          <option value="watched">Просмотрен</option>
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
          <option value="watched">Недавно просмотренные</option>
          <option value="rating">Высокий рейтинг</option>
          <option value="updated">Недавно обновлённые</option>
        </Select>
        <Button type="submit" className="h-11 w-full md:h-10">
          Поиск
        </Button>
      </form>

      {podcasts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {podcasts.map((podcast) => (
            <PodcastCard key={podcast.id} podcast={podcast} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Подкасты не найдены"
          description="Измените фильтры или добавьте новый выпуск в библиотеку."
          action={
            <Link href="/podcasts/new">
              <Button>Добавить подкаст</Button>
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
