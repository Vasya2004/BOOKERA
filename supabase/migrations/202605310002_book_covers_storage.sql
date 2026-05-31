insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'book-covers',
  'book-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Book covers are publicly readable'
  ) then
    create policy "Book covers are publicly readable"
    on storage.objects for select
    using (bucket_id = 'book-covers');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users upload own book covers'
  ) then
    create policy "Users upload own book covers"
    on storage.objects for insert
    to authenticated
    with check (
      bucket_id = 'book-covers'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users update own book covers'
  ) then
    create policy "Users update own book covers"
    on storage.objects for update
    to authenticated
    using (
      bucket_id = 'book-covers'
      and (storage.foldername(name))[1] = auth.uid()::text
    )
    with check (
      bucket_id = 'book-covers'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users delete own book covers'
  ) then
    create policy "Users delete own book covers"
    on storage.objects for delete
    to authenticated
    using (
      bucket_id = 'book-covers'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;
end $$;
