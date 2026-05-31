alter table public.books
add column if not exists page_count integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'books_page_count_check'
      and conrelid = 'public.books'::regclass
  ) then
    alter table public.books
    add constraint books_page_count_check
    check (page_count is null or page_count between 1 and 10000);
  end if;
end $$;
