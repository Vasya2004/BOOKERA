import Link from "next/link";
import { Download } from "lucide-react";
import { ProfileForm } from "@/components/layout/profile-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/server/actions/auth-helpers";

export default async function SettingsPage() {
  const { supabase, user } = await requireUser();
  const profileResult = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileResult.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Настройки
      </h1>

      <ProfileForm
        fullName={profile?.full_name ?? ""}
        avatarUrl={profile?.avatar_url ?? ""}
      />

      <Card className="p-5">
        <h2 className="text-base font-semibold">Export</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Экспорт отдаёт ваши книги, заметки и теги в JSON. Доступен только
          авторизованному пользователю.
        </p>
        <Link href="/api/export" className="mt-4 flex sm:inline-flex">
          <Button variant="secondary" className="w-full sm:w-auto">
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
        </Link>
      </Card>
    </div>
  );
}
