import type { BookStatus } from "@/types/database";
import { cn } from "@/lib/utils/cn";

const labels: Record<BookStatus, string> = {
  to_read: "В очереди",
  reading: "Читаю",
  finished: "Прочитана",
};

const styles: Record<BookStatus, string> = {
  to_read: "bg-muted text-muted-foreground",
  reading: "bg-[#fff0c7] text-[#7b4f16]",
  finished: "bg-[#dfeade] text-[#24513b]",
};

export function bookStatusLabel(status: BookStatus) {
  return labels[status];
}

export function BookStatusBadge({
  status,
  className,
}: {
  status: BookStatus;
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
