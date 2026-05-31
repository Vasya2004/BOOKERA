import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-border bg-[#fffdf8] px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-[#dca64d] focus:ring-2 focus:ring-ring/65",
        className,
      )}
      {...props}
    />
  );
}
