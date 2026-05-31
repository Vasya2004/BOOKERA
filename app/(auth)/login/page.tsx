import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { LoginForm } from "@/components/layout/login-form";
import { Card } from "@/components/ui/card";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-lg p-6">
          <BrandLogo compact />
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Supabase не настроен
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Заполните `NEXT_PUBLIC_SUPABASE_URL` и
            `NEXT_PUBLIC_SUPABASE_ANON_KEY` в `.env.local`, примените SQL
            migration из `supabase/migrations`, затем перезапустите dev server.
          </p>
        </Card>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/library");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md text-[#fff8ec]">
        <div className="mb-8">
          <BrandLogo compact />
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#fff8ec]">
            Войдите в личную библиотеку книг
          </h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
