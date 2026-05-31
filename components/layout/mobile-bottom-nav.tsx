"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BookOpen, Lightbulb, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Дашборд", icon: BarChart3 },
  { href: "/library", label: "Библиотека", icon: BookOpen },
  { href: "/insights", label: "Инсайты", icon: Lightbulb },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    for (const item of navItems) {
      router.prefetch(item.href);
    }
  }, [router]);

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between rounded-[1.6rem] border border-[#dca64d]/35 bg-[#071127]/88 px-2 py-2 shadow-[0_20px_70px_-34px_rgba(3,8,20,0.95)] backdrop-blur-xl md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-2xl px-2 py-2 text-xs font-medium transition-[background-color,transform,color] duration-150 active:scale-[0.97] active:bg-muted/80",
              isActive
                ? "bg-[#dca64d] text-[#071127] shadow-sm active:bg-[#c9943e]"
                : "text-[#d8e2f7] hover:bg-white/9 hover:text-[#fff8ec]",
            )}
          >
            <item.icon className="h-[18px] w-[18px]" />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
