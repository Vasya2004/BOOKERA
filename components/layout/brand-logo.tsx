import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-lg shadow-sm ring-1 ring-[#dca64d]/50",
        className,
      )}
      aria-hidden="true"
    >
      <Image
        src="/logo.png?v=4"
        alt=""
        fill
        sizes="36px"
        className="object-cover"
        unoptimized
        priority
      />
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
          Bookera
        </span>
        {!compact && email ? (
          <span className="mt-0.5 block truncate text-xs opacity-70">
            {email}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
