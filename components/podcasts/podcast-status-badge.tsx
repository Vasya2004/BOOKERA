import type { PodcastStatus } from "@/types/database";
import { cn } from "@/lib/utils/cn";

const labels: Record<PodcastStatus, string> = {
  want_to_watch: "В планах",
  watching: "Смотрю",
  watched: "Просмотрен",
};

const styles: Record<PodcastStatus, string> = {
  want_to_watch: "bg-muted text-muted-foreground",
  watching: "bg-accent text-accent-foreground",
  watched: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

export function PodcastStatusBadge({
  status,
  className,
}: {
  status: PodcastStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        styles[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  );
}
