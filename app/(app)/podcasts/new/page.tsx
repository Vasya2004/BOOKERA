import { PodcastForm } from "@/components/podcasts/podcast-form";
import { createPodcast } from "@/server/actions/podcasts";

export default function NewPodcastPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Добавить подкаст
      </h1>
      <PodcastForm action={createPodcast} mode="create" />
    </div>
  );
}
