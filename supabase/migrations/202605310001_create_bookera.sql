create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text,
  cover_url text,
  isbn text,
  published_year integer,
  page_count integer,
  description text,
  status text not null default 'to_read',
  personal_rating integer,
  finished_at timestamptz,
  main_takeaway text,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint books_status_check check (status in ('to_read', 'reading', 'finished')),
  constraint books_rating_check check (personal_rating is null or personal_rating between 1 and 10),
  constraint books_year_check check (published_year is null or published_year between 0 and 3000),
  constraint books_page_count_check check (page_count is null or page_count between 1 and 10000)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  type text not null,
  content text not null,
  page_number integer,
  chapter_number integer,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notes_type_check check (type in ('insight', 'quote', 'idea', 'action', 'question')),
  constraint notes_page_check check (page_number is null or page_number > 0),
  constraint notes_chapter_number_check check (chapter_number is null or chapter_number between 1 and 20)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  constraint tags_user_name_unique unique (user_id, name)
);

create table public.book_tags (
  book_id uuid not null references public.books(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (book_id, tag_id)
);

create table public.note_tags (
  note_id uuid not null references public.notes(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (note_id, tag_id)
);

create index books_user_status_idx on public.books(user_id, status);
create index books_user_created_idx on public.books(user_id, created_at desc);
create index books_user_finished_idx on public.books(user_id, finished_at desc nulls last);
create index books_user_rating_idx on public.books(user_id, personal_rating desc nulls last);
create index books_search_idx on public.books using gin (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(author, '') || ' ' || coalesce(description, ''))
);
create index notes_user_type_idx on public.notes(user_id, type);
create index notes_book_created_idx on public.notes(book_id, created_at desc);
create index notes_book_chapter_idx on public.notes(book_id, chapter_number, created_at desc);
create index notes_user_favorite_idx on public.notes(user_id, is_favorite) where is_favorite = true;
create index book_tags_user_idx on public.book_tags(user_id, tag_id);
create index note_tags_user_idx on public.note_tags(user_id, tag_id);

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger books_updated_at
before update on public.books
for each row execute function public.set_updated_at();

create trigger notes_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.notes enable row level security;
alter table public.tags enable row level security;
alter table public.book_tags enable row level security;
alter table public.note_tags enable row level security;

grant usage on schema public to authenticated;

grant select, insert, update, delete
on table
  public.profiles,
  public.books,
  public.notes,
  public.tags,
  public.book_tags,
  public.note_tags
to authenticated;

create policy "Profiles are private"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users manage own books"
on public.books for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own notes"
on public.notes for all
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.books
    where books.id = notes.book_id
    and books.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.books
    where books.id = notes.book_id
    and books.user_id = auth.uid()
  )
);

create policy "Users manage own tags"
on public.tags for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own book tags"
on public.book_tags for all
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.books
    where books.id = book_tags.book_id
    and books.user_id = auth.uid()
  )
  and exists (
    select 1 from public.tags
    where tags.id = book_tags.tag_id
    and tags.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.books
    where books.id = book_tags.book_id
    and books.user_id = auth.uid()
  )
  and exists (
    select 1 from public.tags
    where tags.id = book_tags.tag_id
    and tags.user_id = auth.uid()
  )
);

create policy "Users manage own note tags"
on public.note_tags for all
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.notes
    where notes.id = note_tags.note_id
    and notes.user_id = auth.uid()
  )
  and exists (
    select 1 from public.tags
    where tags.id = note_tags.tag_id
    and tags.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.notes
    where notes.id = note_tags.note_id
    and notes.user_id = auth.uid()
  )
  and exists (
    select 1 from public.tags
    where tags.id = note_tags.tag_id
    and tags.user_id = auth.uid()
  )
);
