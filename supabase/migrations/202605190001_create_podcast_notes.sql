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

create table public.podcasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  youtube_url text not null,
  youtube_video_id text not null,
  title text not null,
  channel_title text,
  thumbnail_url text,
  duration_seconds integer,
  published_at timestamptz,
  description text,
  status text not null default 'want_to_watch',
  personal_rating integer,
  watched_at timestamptz,
  main_takeaway text,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint podcasts_status_check check (status in ('want_to_watch', 'watching', 'watched')),
  constraint podcasts_rating_check check (personal_rating is null or personal_rating between 1 and 10),
  constraint podcasts_user_video_unique unique (user_id, youtube_video_id)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  podcast_id uuid not null references public.podcasts(id) on delete cascade,
  type text not null,
  content text not null,
  timestamp_seconds integer,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notes_type_check check (type in ('thought', 'insight', 'idea', 'action', 'question')),
  constraint notes_timestamp_check check (timestamp_seconds is null or timestamp_seconds >= 0)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  constraint tags_user_name_unique unique (user_id, name)
);

create table public.podcast_tags (
  podcast_id uuid not null references public.podcasts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (podcast_id, tag_id)
);

create table public.note_tags (
  note_id uuid not null references public.notes(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (note_id, tag_id)
);

create index podcasts_user_status_idx on public.podcasts(user_id, status);
create index podcasts_user_created_idx on public.podcasts(user_id, created_at desc);
create index podcasts_user_watched_idx on public.podcasts(user_id, watched_at desc nulls last);
create index podcasts_user_rating_idx on public.podcasts(user_id, personal_rating desc nulls last);
create index podcasts_search_idx on public.podcasts using gin (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(channel_title, '') || ' ' || coalesce(description, ''))
);
create index notes_user_type_idx on public.notes(user_id, type);
create index notes_podcast_created_idx on public.notes(podcast_id, created_at desc);
create index notes_user_favorite_idx on public.notes(user_id, is_favorite) where is_favorite = true;
create index podcast_tags_user_idx on public.podcast_tags(user_id, tag_id);
create index note_tags_user_idx on public.note_tags(user_id, tag_id);

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger podcasts_updated_at
before update on public.podcasts
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
alter table public.podcasts enable row level security;
alter table public.notes enable row level security;
alter table public.tags enable row level security;
alter table public.podcast_tags enable row level security;
alter table public.note_tags enable row level security;

grant usage on schema public to authenticated;

grant select, insert, update, delete
on table
  public.profiles,
  public.podcasts,
  public.notes,
  public.tags,
  public.podcast_tags,
  public.note_tags
to authenticated;

create policy "Profiles are private"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users manage own podcasts"
on public.podcasts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own notes"
on public.notes for all
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.podcasts
    where podcasts.id = notes.podcast_id
    and podcasts.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.podcasts
    where podcasts.id = notes.podcast_id
    and podcasts.user_id = auth.uid()
  )
);

create policy "Users manage own tags"
on public.tags for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own podcast tags"
on public.podcast_tags for all
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.podcasts
    where podcasts.id = podcast_tags.podcast_id
    and podcasts.user_id = auth.uid()
  )
  and exists (
    select 1 from public.tags
    where tags.id = podcast_tags.tag_id
    and tags.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.podcasts
    where podcasts.id = podcast_tags.podcast_id
    and podcasts.user_id = auth.uid()
  )
  and exists (
    select 1 from public.tags
    where tags.id = podcast_tags.tag_id
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
