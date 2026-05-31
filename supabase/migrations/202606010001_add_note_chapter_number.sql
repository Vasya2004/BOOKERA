alter table public.notes
add column if not exists chapter_number integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notes_chapter_number_check'
      and conrelid = 'public.notes'::regclass
  ) then
    alter table public.notes
    add constraint notes_chapter_number_check
    check (chapter_number is null or chapter_number between 1 and 20);
  end if;
end $$;

create index if not exists notes_book_chapter_idx
on public.notes(book_id, chapter_number, created_at desc);
