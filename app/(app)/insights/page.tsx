import { NoteCard } from "@/components/notes/note-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getInsights, getTags } from "@/server/queries/podcasts";
import type { NoteType } from "@/types/database";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InsightsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = getParam(params.q);
  const type = getParam(params.type) as NoteType | "all" | undefined;
  const tag = getParam(params.tag);
  const favorite = getParam(params.favorite) === "true";
  const [notes, tags] = await Promise.all([
    getInsights({ q, type, tag, favorite }),
    getTags(),
  ]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Заметки
      </h1>

      <form className="grid gap-2.5 rounded-xl border border-border bg-card p-3 sm:gap-3 md:grid-cols-[1fr_170px_180px_150px_auto]">
        <SearchInput defaultValue={q} placeholder="Поиск по заметкам" />
        <Select name="type" defaultValue={type ?? "all"} className="h-11 md:h-10">
          <option value="all">Все типы</option>
          <option value="thought">Мысли</option>
          <option value="insight">Инсайты</option>
          <option value="idea">Идеи</option>
          <option value="action">Действия</option>
          <option value="quote">Цитаты</option>
        </Select>
        <Select name="tag" defaultValue={tag ?? "all"} className="h-11 md:h-10">
          <option value="all">Все теги</option>
          {tags.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select name="favorite" defaultValue={favorite ? "true" : "false"} className="h-11 md:h-10">
          <option value="false">Все</option>
          <option value="true">Избранные</option>
        </Select>
        <Button type="submit" className="h-11 w-full md:h-10">
          Поиск
        </Button>
      </form>

      {notes.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} showPodcast compact />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Инсайты не найдены"
          description="Создавайте заметки типов thought, insight, idea, action или quote на страницах подкастов."
        />
      )}
    </div>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
