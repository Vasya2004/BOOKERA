create table if not exists public.google_drive_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  token_expires_at timestamptz not null,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger google_drive_connections_updated_at
before update on public.google_drive_connections
for each row execute function public.set_updated_at();

alter table public.google_drive_connections enable row level security;

grant select, insert, update, delete
on table public.google_drive_connections
to authenticated;

create policy "Users manage own google drive connection"
on public.google_drive_connections for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
