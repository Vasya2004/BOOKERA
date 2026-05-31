import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm ring-1 ring-[#dca64d]/20 hover:bg-[#142b55] hover:ring-[#dca64d]/45 disabled:opacity-50",
  secondary:
    "border border-border bg-[#fffaf1] text-foreground shadow-sm hover:bg-[#f2e5cd] disabled:opacity-50",
  ghost: "text-foreground hover:bg-[#efe5d4]/80 disabled:opacity-50",
  destructive:
    "bg-destructive text-destructive-foreground hover:opacity-95 disabled:opacity-50",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium outline-none transition-[background-color,box-shadow,transform,opacity] duration-150 active:scale-[0.98] active:brightness-95 md:hover:-translate-y-0.5 md:hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
