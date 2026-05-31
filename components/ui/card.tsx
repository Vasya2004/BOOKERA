import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-[0_20px_70px_-50px_rgba(7,17,39,0.85)]",
        className,
      )}
      {...props}
    />
  );
}
