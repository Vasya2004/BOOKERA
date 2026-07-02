alter table public.notes
add column if not exists chapter_title text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notes_chapter_title_check'
      and conrelid = 'public.notes'::regclass
  ) then
    alter table public.notes
    add constraint notes_chapter_title_check
    check (chapter_title is null or char_length(trim(chapter_title)) between 1 and 120);
  end if;
end $$;

create index if not exists notes_book_chapter_title_idx
on public.notes(book_id, chapter_title, created_at desc);
