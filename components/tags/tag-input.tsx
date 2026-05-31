import { Input } from "@/components/ui/input";
import type { Tag } from "@/types/domain";

export function TagInput({ defaultTags = [] }: { defaultTags?: Tag[] }) {
  return (
    <Input
      name="tags"
      placeholder="мышление, стратегия, память"
      defaultValue={defaultTags.map((tag) => tag.name).join(", ")}
    />
  );
}

export function TagList({ tags, compact = false }: { tags: Tag[]; compact?: boolean }) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={compact ? "flex flex-wrap gap-1" : "flex flex-wrap gap-1.5"}>
      {tags.map((tag) => (
        <span
          key={tag.id}
          className={
            compact
              ? "inline-flex max-w-[120px] items-center rounded-full border border-border bg-muted/80 px-1.5 py-0.5 text-[10px] text-muted-foreground"
              : "inline-flex max-w-[180px] items-center rounded-full border border-border bg-muted/80 px-2 py-0.5 text-xs text-muted-foreground"
          }
          title={tag.name}
        >
          <span
            className={compact ? "mr-1 h-1.5 w-1.5 rounded-full" : "mr-1.5 h-1.5 w-1.5 rounded-full"}
            style={{ backgroundColor: tag.color ?? "#dca64d" }}
          />
          <span className="truncate">{tag.name}</span>
        </span>
      ))}
    </div>
  );
}
