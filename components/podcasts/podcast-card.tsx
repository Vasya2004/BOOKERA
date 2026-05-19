import Image from "next/image";
import Link from "next/link";
import { Calendar, MessageSquare, Star } from "lucide-react";
import { PodcastStatusBadge } from "@/components/podcasts/podcast-status-badge";
import { TagList } from "@/components/tags/tag-input";
import { Card } from "@/components/ui/card";
import type { Podcast } from "@/types/domain";

export function PodcastCard({ podcast }: { podcast: Podcast }) {
  return (
    <Link href={`/podcasts/${podcast.id}`}>
      <Card className="group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-video bg-muted">
          {podcast.thumbnailUrl ? (
            <Image
              src={podcast.thumbnailUrl}
              alt=""
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
              loading="eager"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No preview
            </div>
          )}
        </div>
        <div className="space-y-3 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="line-clamp-2 text-sm font-semibold leading-5 group-hover:underline">
                {podcast.title}
              </h2>
              {podcast.channelTitle ? (
                <p className="mt-1 text-xs text-muted-foreground">{podcast.channelTitle}</p>
              ) : null}
            </div>
            <PodcastStatusBadge status={podcast.status} />
          </div>
          <TagList tags={podcast.tags} />
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              {podcast.personalRating ? `${podcast.personalRating}/10` : "—"}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {podcast.notesCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Intl.DateTimeFormat("ru", { dateStyle: "medium" }).format(
                new Date(podcast.createdAt),
              )}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
