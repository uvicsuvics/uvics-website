begin;
do $$
begin
  if (select count(*) from public.pages where slug like 'seed-%') <> 2 then raise exception 'seed must create 2 pages'; end if;
  if (select count(*) from public.programs where slug like 'seed-%') <> 2 then raise exception 'seed must create 2 programs'; end if;
  if (select count(*) from public.competitions where slug like 'seed-%') <> 2 then raise exception 'seed must create 2 competitions'; end if;
  if (select count(*) from public.achievements where slug like 'seed-%') <> 2 then raise exception 'seed must create 2 achievements'; end if;
  if (select count(*) from public.projects where slug like 'seed-%') <> 2 then raise exception 'seed must create 2 projects'; end if;
  if (select count(*) from public.achievement_members) <> 3 or (select count(*) from public.project_members) <> 2 then
    raise exception 'seed member rows must be idempotent';
  end if;
end$$;
set local role anon;
do $$
begin
  if exists (select from public.pages where status <> 'PUBLISHED')
     or exists (select from public.competitions where publication_status <> 'PUBLISHED') then
    raise exception 'draft seed visible to anon';
  end if;
  if (select count(*) from public.achievement_members) <> 2 then raise exception 'anon must see only members of published seed achievement'; end if;
end$$;
reset role;
rollback;
