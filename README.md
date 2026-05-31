# Bookera

MVP веб-приложения для личной библиотеки книг:
книги, статусы чтения, цитаты, инсайты, идеи, действия, вопросы, теги,
рейтинг и экспорт данных.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style local primitives
- Supabase Auth, PostgreSQL, RLS
- Zod
- Lucide React
- Vitest

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
```

`OPENAI_API_KEY` is reserved for the optional AI module.

Apply the migration in Supabase:

```bash
supabase/migrations/202605310001_create_bookera.sql
supabase/migrations/202605310002_book_covers_storage.sql
supabase/migrations/202605310003_add_book_page_count.sql
supabase/migrations/202606010001_add_note_chapter_number.sql
```

Then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
