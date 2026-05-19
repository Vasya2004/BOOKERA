import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
      >
        <rect x="5" y="7" width="14" height="18" rx="3.5" stroke="currentColor" strokeWidth="2.2" />
        <path d="M12 13.2L16 16L12 18.8V13.2Z" fill="currentColor" />
        <path
          d="M21.5 12.5C23.3 14.3 24.2 16.6 24.2 19C24.2 21.4 23.3 23.7 21.5 25.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M24.8 10C27.2 12.4 28.4 15.6 28.4 19C28.4 22.4 27.2 25.6 24.8 28"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
    </span>
  );
}

export function BrandLogo({
  email,
  compact = false,
}: {
  email?: string;
  compact?: boolean;
}) {
  return (
    <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
      <BrandMark />
      <span className="min-w-0">
        <span className="block text-base font-semibold leading-tight tracking-tight">
          Podcastera
        </span>
        {!compact && email ? (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {email}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
