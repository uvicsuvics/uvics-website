begin;

insert into auth.users (id) values ('00000000-0000-4000-8000-000000000001'), ('00000000-0000-4000-8000-000000000002');
insert into public.admins (id, name, is_active) values ('00000000-0000-4000-8000-000000000001', 'CMS Admin', true);
insert into auth.sessions (id, user_id, created_at) values ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', statement_timestamp());

insert into public.pages (id, title, slug, status) values
  ('00000000-0000-4000-8000-000000000801', 'Draft Page', 'draft-page', 'DRAFT'),
  ('00000000-0000-4000-8000-000000000802', 'Published Page', 'published-page', 'PUBLISHED'),
  ('00000000-0000-4000-8000-000000000803', 'Archived Page', 'archived-page', 'ARCHIVED');
insert into public.programs (id, name, slug, status) values
  ('00000000-0000-4000-8000-000000000811', 'Draft Program', 'draft-program', 'DRAFT'),
  ('00000000-0000-4000-8000-000000000812', 'Published Program', 'published-program', 'PUBLISHED'),
  ('00000000-0000-4000-8000-000000000813', 'Archived Program', 'archived-program', 'ARCHIVED');
insert into public.website_settings (key, value) values ('organization_name', '"UVICS"');

do $$
begin
  begin
    insert into public.pages (title, slug) values ('Bad', 'Bad Slug!');
    raise exception 'invalid page slug accepted';
  exception when check_violation then null; end;
  begin
    insert into public.programs (name, slug) values ('Dup', 'draft-program');
    raise exception 'duplicate program slug accepted';
  exception when unique_violation then null; end;
  begin
    insert into public.website_settings (key, value) values ('Bad-Key', '1');
    raise exception 'invalid settings key accepted';
  exception when check_violation then null; end;
end$$;

set local role anon;
do $$
begin
  if (select count(*) from public.pages) <> 1 then raise exception 'anon must see only published pages'; end if;
  if (select count(*) from public.programs) <> 1 then raise exception 'anon must see only published programs'; end if;
  begin
    perform public.publish_page('00000000-0000-4000-8000-000000000801');
    raise exception 'anon must not publish pages';
  exception when insufficient_privilege then null; end;
end$$;
reset role;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002"}', true);
set local role authenticated;
do $$
begin
  if (select count(*) from public.pages) <> 1 then raise exception 'non-admin must see only published pages'; end if;
  if (select count(*) from public.programs) <> 1 then raise exception 'non-admin must see only published programs'; end if;
  begin
    perform public.publish_program('00000000-0000-4000-8000-000000000811');
    raise exception 'non-admin must not publish programs';
  exception when insufficient_privilege then null; end;
end$$;
reset role;

select set_config('request.jwt.claims', jsonb_build_object('sub', '00000000-0000-4000-8000-000000000001'::uuid, 'session_id', '00000000-0000-4000-8000-000000000011'::uuid)::text, true);
set local role authenticated;
do $$
begin
  if (select count(*) from public.pages) <> 3 then raise exception 'active admin must read draft and archived pages'; end if;
  if (select count(*) from public.programs) <> 3 then raise exception 'active admin must read draft and archived programs'; end if;
  if not exists (select from public.website_settings where key = 'organization_name') then raise exception 'active admin must read settings'; end if;
  perform public.publish_page('00000000-0000-4000-8000-000000000801');
  perform public.publish_program('00000000-0000-4000-8000-000000000811');
end$$;
reset role;

do $$
begin
  if (select status from public.pages where id = '00000000-0000-4000-8000-000000000801') <> 'PUBLISHED'
     or (select published_at from public.pages where id = '00000000-0000-4000-8000-000000000801') is null then
    raise exception 'publish_page must publish and stamp published_at';
  end if;
  if (select status from public.programs where id = '00000000-0000-4000-8000-000000000811') <> 'PUBLISHED' then
    raise exception 'publish_program must publish';
  end if;
end$$;

rollback;
