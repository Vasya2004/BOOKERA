import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-md border border-border bg-[#fffdf8] px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-[#dca64d] focus:ring-2 focus:ring-ring/65",
        className,
      )}
      {...props}
    />
  );
}
