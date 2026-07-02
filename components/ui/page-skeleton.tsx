import { Card } from "@/components/ui/card";

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-40 rounded-md bg-muted/80" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-28 bg-muted/50" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="h-36 bg-muted/50" />
        ))}
      </div>
    </div>
  );
}

export function BookPageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 w-32 rounded bg-muted/80" />
      <div className="flex gap-4">
        <div className="h-28 w-20 rounded-md bg-muted/80" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 rounded bg-muted/70" />
          <div className="h-7 w-3/4 rounded bg-muted/80" />
          <div className="h-4 w-1/2 rounded bg-muted/70" />
        </div>
      </div>
      <Card className="h-36 bg-muted/50" />
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-24 bg-muted/50" />
        ))}
      </div>
    </div>
  );
}

export function NotesPanelSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <Card className="h-36 bg-muted/50" />
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-20 bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
