import { NoteCard } from "@/components/notes/note-card";
import { DatabaseSetupCard } from "@/components/layout/database-setup-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatabaseSetupError, getInsights } from "@/server/queries/books";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InsightsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = getParam(params.q);
  const favorite = getParam(params.favorite) === "true";
  let notes;

  try {
    notes = await getInsights({ q, favorite });
  } catch (error) {
    if (error instanceof DatabaseSetupError) {
      return <DatabaseSetupCard message={error.message} />;
    }
    throw error;
  }

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Заметки</h1>

      <form className="flex flex-col gap-2.5 sm:flex-row">
        <div className="flex-1">
          <SearchInput defaultValue={q} placeholder="Поиск по тексту" />
        </div>
        <Select name="favorite" defaultValue={favorite ? "true" : "false"} className="h-11 sm:h-10 sm:w-40">
          <option value="false">Все</option>
          <option value="true">Избранные</option>
        </Select>
        <Button type="submit" className="h-11 sm:h-10 sm:px-5">
          Найти
        </Button>
      </form>

      {notes.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} showBook compact />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Заметок нет"
          description="Заметки появятся здесь после того, как вы добавите их на странице книги."
        />
      )}
    </div>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
