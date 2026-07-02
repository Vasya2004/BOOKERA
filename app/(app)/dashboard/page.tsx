import Link from "next/link";
import { ArrowRight, BookMarked, BookOpen, FileText, Lightbulb, Star } from "lucide-react";
import { BookCard } from "@/components/books/book-card";
import { DatabaseSetupCard } from "@/components/layout/database-setup-card";
import { NoteCard } from "@/components/notes/note-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DatabaseSetupError, getDashboardData } from "@/server/queries/books";

export default async function DashboardPage() {
  let data;

  try {
    data = await getDashboardData();
  } catch (error) {
    if (error instanceof DatabaseSetupError) {
      return <DatabaseSetupCard message={error.message} />;
    }
    throw error;
  }

  const { stats, recentBooks, favoriteInsights } = data;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Дашборд
        </h1>
        <Link href="/library/new" className="sm:shrink-0">
          <Button className="h-11 w-full sm:h-10 sm:w-auto">
            Добавить книгу
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <section className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
        <StatCard icon={BookMarked} label="Прочитано книг" value={stats.finishedCount} />
        <StatCard icon={FileText} label="Прочитано страниц" value={stats.finishedPagesCount} />
        <StatCard icon={Lightbulb} label="Инсайтов" value={stats.insightsCount} />
        <StatCard icon={Star} label="Избранные заметки" value={stats.favoriteNotesCount} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Последние книги</h2>
          <Link href="/library" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            В библиотеку
          </Link>
        </div>
        {recentBooks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {recentBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Библиотека пока пустая"
            description="Добавьте первую книгу и начните собирать инсайты, цитаты и действия."
            action={
              <Link href="/library/new">
                <Button>Добавить книгу</Button>
              </Link>
            }
          />
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Избранные заметки</h2>
          <Link href="/insights" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Все заметки
          </Link>
        </div>
        {favoriteInsights.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {favoriteInsights.map((note) => (
              <NoteCard key={note.id} note={note} showBook />
            ))}
          </div>
        ) : (
          <Card className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
            <BookOpen className="h-5 w-5" />
            Отмечайте важные заметки звёздочкой, чтобы они появлялись здесь.
          </Card>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="mt-4 text-2xl font-semibold sm:mt-5 sm:text-3xl">{value}</div>
    </Card>
  );
}
