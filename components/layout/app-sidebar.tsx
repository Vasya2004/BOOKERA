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
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

const navItems = [
  { href: "/dashboard", label: "Дашборд", icon: BarChart3 },
  { href: "/library", label: "Библиотека", icon: BookOpen },
  { href: "/insights", label: "Заметки", icon: Lightbulb },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function AppSidebar({ email }: { email: string }) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#071127]/92 px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.875rem)] text-[#fff8ec] shadow-[0_10px_40px_-28px_rgba(0,0,0,0.75)] backdrop-blur md:hidden">
        <div className="flex min-h-10 items-center justify-between gap-3">
          <BrandLogo compact />
          <Link href="/library/new">
            <Button className="h-9 rounded-full px-3" aria-label="Добавить книгу">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#dca64d]/28 bg-[linear-gradient(180deg,#13264c_0%,#071127_54%,#030814_100%)] text-[#fff8ec] shadow-[18px_0_60px_-46px_rgba(0,0,0,0.9)] backdrop-blur md:block">
        <div className="px-5 py-6">
          <BrandLogo email={email} />
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#d8e2f7] transition hover:bg-white/9 hover:text-[#fff8ec] hover:shadow-[inset_3px_0_0_#dca64d]"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 pt-4">
          <Link href="/library/new">
            <Button className="w-full">
              <Plus className="h-4 w-4" />
              Добавить книгу
            </Button>
          </Link>
        </div>
        <form action={signOut} className="absolute bottom-4 w-full px-3">
          <Button variant="ghost" type="submit" className="w-full justify-start text-[#fff8ec] hover:bg-white/9">
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </form>
      </aside>

      <MobileBottomNav />
    </>
  );
}
