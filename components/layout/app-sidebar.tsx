import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Lightbulb,
  LogOut,
  Plus,
  Settings,
} from "lucide-react";
import { signOut } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";

const navItems = [
  { href: "/dashboard", label: "Дашборд", icon: BarChart3 },
  { href: "/podcasts", label: "Подкасты", icon: BookOpen },
  { href: "/insights", label: "Заметки", icon: Lightbulb },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function AppSidebar({ email }: { email: string }) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo compact />
          <Link href="/podcasts/new">
            <Button className="h-9 rounded-full px-3" aria-label="Добавить подкаст">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card/90 backdrop-blur md:block">
        <div className="px-5 py-6">
          <BrandLogo email={email} />
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 pt-4">
          <Link href="/podcasts/new">
            <Button className="w-full">
              <Plus className="h-4 w-4" />
              Добавить подкаст
            </Button>
          </Link>
        </div>
        <form action={signOut} className="absolute bottom-4 w-full px-3">
          <Button variant="ghost" type="submit" className="w-full justify-start">
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </form>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-card/95 px-1.5 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pt-1.5 backdrop-blur md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <item.icon className="h-4 w-4" />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
