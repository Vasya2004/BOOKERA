import { AppSidebar } from "@/components/layout/app-sidebar";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { requireUser } from "@/server/actions/auth-helpers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasSupabaseEnv()) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-lg p-6">
          <h1 className="text-2xl font-semibold">Supabase не настроен</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Для защищённого приложения нужны `NEXT_PUBLIC_SUPABASE_URL` и
            `NEXT_PUBLIC_SUPABASE_ANON_KEY` в `.env.local`.
          </p>
        </Card>
      </main>
    );
  }

  const { user } = await requireUser();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-transparent">
      <AppSidebar email={user.email ?? ""} />
      <main className="mx-auto min-h-screen w-full max-w-[1500px] overflow-x-hidden bg-[linear-gradient(180deg,#fff8ec_0%,#f4ead7_58%,#ead8b8_100%)] px-3 pb-32 pt-[calc(env(safe-area-inset-top,0px)+5.25rem)] text-foreground shadow-[inset_18px_0_55px_-48px_rgba(4,12,28,0.9)] sm:px-4 md:rounded-l-[2rem] md:pb-8 md:pl-72 md:pr-8 md:pt-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
