import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block w-full">
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-md border border-border bg-card py-0 pl-3 pr-11 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring",
          className,
        )}
        {...props}
      />
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
    </span>
  );
}
