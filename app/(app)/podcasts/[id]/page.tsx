import { notFound } from "next/navigation";
import { NoteCard } from "@/components/notes/note-card";
import { NoteEditor } from "@/components/notes/note-editor";
import { PodcastForm } from "@/components/podcasts/podcast-form";
import { PodcastStatusBadge } from "@/components/podcasts/podcast-status-badge";
import { YouTubeEmbed } from "@/components/podcasts/youtube-embed";
import { TagList } from "@/components/tags/tag-input";
import { Card } from "@/components/ui/card";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { deletePodcast, updatePodcast } from "@/server/actions/podcasts";
import { getPodcast, getPodcastNotes } from "@/server/queries/podcasts";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PodcastDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  await searchParams;
  const [podcast, notes] = await Promise.all([
    getPodcast(id),
    getPodcastNotes(id, "all"),
  ]);

  if (!podcast) {
    notFound();
  }

  const updateAction = updatePodcast.bind(null, podcast.id);
  const deleteAction = deletePodcast.bind(null, podcast.id);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-4">
          <YouTubeEmbed videoId={podcast.youtubeVideoId} title={podcast.title} />
          <Card className="p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <PodcastStatusBadge status={podcast.status} />
                  {podcast.personalRating ? (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      {podcast.personalRating}/10
                    </span>
                  ) : null}
                </div>
                <div>
                  <h1 className="break-words text-lg font-semibold tracking-tight sm:text-xl">
                    {podcast.title}
                  </h1>
                  {podcast.channelTitle ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {podcast.channelTitle}
                    </p>
                  ) : null}
                </div>
                <TagList tags={podcast.tags} />
              </div>
              <ConfirmDeleteDialog action={deleteAction} />
            </div>
            {podcast.mainTakeaway ? (
              <div className="mt-5 rounded-lg border border-border bg-muted/60 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Главный вывод
                </p>
                <p className="mt-2 text-sm leading-6">{podcast.mainTakeaway}</p>
              </div>
            ) : null}
          </Card>
          <NoteEditor podcastId={podcast.id} />
          <details className="rounded-lg border border-border bg-card p-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Метаданные и настройки
            </summary>
            <div className="mt-4 [&>div]:border-0 [&>div]:p-0 [&>div]:shadow-none">
              <PodcastForm podcast={podcast} action={updateAction} />
            </div>
          </details>
        </section>

        <aside className="space-y-4">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Заметки</h2>
            {notes.length > 0 ? (
              <div className="space-y-3">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Заметок пока нет"
                description="Пишите мысли, инсайты и действия по ходу просмотра."
              />
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
