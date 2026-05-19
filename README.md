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
GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=
GOOGLE_DRIVE_REDIRECT_URI=
```

`YOUTUBE_API_KEY` is optional and used only server-side for metadata lookup.
`OPENAI_API_KEY` is reserved for the optional AI module.
Google Drive variables are optional and used for backup sync from Settings.

Apply the migration in Supabase:

```bash
supabase/migrations/202605190001_create_podcast_notes.sql
```

Then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For local Google Drive OAuth callback use:
`GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3000/api/google-drive/callback`.

## Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
