update public.notes
set type = 'thought'
where type = 'quote';

alter table public.notes
drop constraint if exists notes_type_check;

alter table public.notes
add constraint notes_type_check
check (type in ('thought', 'insight', 'idea', 'action', 'question'));
