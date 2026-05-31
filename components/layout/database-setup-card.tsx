import { Card } from "@/components/ui/card";

export function DatabaseSetupCard({ message }: { message: string }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="max-w-2xl p-6">
        <h1 className="text-2xl font-semibold">База данных ещё не настроена</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
        <div className="mt-4 rounded-md border border-border bg-muted p-3 text-sm">
          <p className="font-medium">Что сделать:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
            <li>Откройте Supabase Dashboard вашего проекта.</li>
            <li>Перейдите в SQL Editor.</li>
            <li>
              Выполните файл{" "}
              <code>supabase/migrations/202605310001_create_bookera.sql</code>.
            </li>
            <li>Обновите эту страницу.</li>
          </ol>
        </div>
      </Card>
    </main>
  );
}
