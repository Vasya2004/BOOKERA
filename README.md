# Podcastera

MVP веб-приложения для личной библиотеки просмотренных YouTube-подкастов:
подкасты, статусы просмотра, заметки с таймкодами, инсайты, теги, рейтинг,
и экспорт данных.

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
YOUTUBE_API_KEY=
OPENAI_API_KEY=
```

`YOUTUBE_API_KEY` is optional and used only server-side for metadata lookup.
`OPENAI_API_KEY` is reserved for the optional AI module.

Apply the migration in Supabase:

```bash
supabase/migrations/202605190001_create_podcast_notes.sql
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
