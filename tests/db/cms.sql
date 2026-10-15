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
insert into public.website_settings (key, value) values
  ('organization_name', '"UVICS"'),
  ('internal_secret', '"secret-value"');

-- Constraints check
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

-- Guest (anon): hanya melihat published, tidak bisa membaca raw settings atau memanggil RPC mutasi
set local role anon;
do $$
begin
  if (select count(*) from public.pages) <> 1 then raise exception 'anon must see only published pages'; end if;
  if (select count(*) from public.programs) <> 1 then raise exception 'anon must see only published programs'; end if;
  begin
    perform key from public.website_settings;
    raise exception 'anon must not read raw website_settings';
  exception when insufficient_privilege then null; end;

  if (public.read_public_settings() ? 'internal_secret') then
    raise exception 'private setting leaked to anon';
  end if;

  begin
    perform public.create_page('{"title":"Anon","slug":"anon-page"}'::jsonb);
    raise exception 'anon must not create pages';
  exception when insufficient_privilege then null; end;

  begin
    perform public.publish_page('00000000-0000-4000-8000-000000000801');
    raise exception 'anon must not publish pages';
  exception when insufficient_privilege then null; end;

  begin
    perform public.update_website_settings('{"organization_name":"Hacked"}'::jsonb);
    raise exception 'anon must not update settings';
  exception when insufficient_privilege then null; end;
end$$;
reset role;

-- Non-admin (authenticated tanpa sesi admin): ditolak di semua RPC dan query langsung
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002"}', true);
set local role authenticated;
do $$
begin
  if (select count(*) from public.pages) <> 1 then raise exception 'non-admin must see only published pages'; end if;
  if (select count(*) from public.programs) <> 1 then raise exception 'non-admin must see only published programs'; end if;
  if exists (select from public.website_settings) then raise exception 'non-admin must not read raw website_settings'; end if;

  begin
    perform public.create_page('{"title":"Non-admin","slug":"na-page"}'::jsonb);
    raise exception 'non-admin must not create pages';
  exception when insufficient_privilege then null; end;

  begin
    perform public.update_page('00000000-0000-4000-8000-000000000801', '{"title":"New"}'::jsonb);
    raise exception 'non-admin must not update pages';
  exception when insufficient_privilege then null; end;

  begin
    perform public.archive_page('00000000-0000-4000-8000-000000000801');
    raise exception 'non-admin must not archive pages';
  exception when insufficient_privilege then null; end;

  begin
    perform public.create_program('{"name":"Non-admin","slug":"na-prog"}'::jsonb);
    raise exception 'non-admin must not create programs';
  exception when insufficient_privilege then null; end;

  begin
    perform public.publish_program('00000000-0000-4000-8000-000000000811');
    raise exception 'non-admin must not publish programs';
  exception when insufficient_privilege then null; end;

  begin
    perform public.update_website_settings('{"organization_name":"Hacked"}'::jsonb);
    raise exception 'non-admin must not update settings';
  exception when insufficient_privilege then null; end;
end$$;
reset role;

-- Active Admin: dapat membaca draft/archived, DML langsung ditolak, mutasi via RPC berjalan atomik + ter-audit
select set_config('request.jwt.claims', jsonb_build_object('sub', '00000000-0000-4000-8000-000000000001'::uuid, 'session_id', '00000000-0000-4000-8000-000000000011'::uuid)::text, true);
set local role authenticated;
do $$
declare
  created_p jsonb;
  created_pr jsonb;
  settings_res jsonb;
  audit_rec public.audit_logs;
begin
  if (select count(*) from public.pages) <> 3 then raise exception 'active admin must read draft and archived pages'; end if;
  if (select count(*) from public.programs) <> 3 then raise exception 'active admin must read draft and archived programs'; end if;
  if (select count(*) from public.website_settings) <> 2 then raise exception 'active admin must read raw settings'; end if;

  -- Direct DML ditolak
  begin
    insert into public.pages (title, slug) values ('Direct', 'direct-page');
    raise exception 'direct insert on pages must be rejected';
  exception when insufficient_privilege then null; end;

  begin
    update public.programs set name = 'Direct' where id = '00000000-0000-4000-8000-000000000811';
    raise exception 'direct update on programs must be rejected';
  exception when insufficient_privilege then null; end;

  -- 1. Create page
  created_p := public.create_page('{"title":"New Page","slug":"new-page","content":"Hello"}'::jsonb);
  if created_p->>'status' <> 'DRAFT' or created_p->>'slug' <> 'new-page' then
    raise exception 'create_page output mismatch';
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'PAGE_CREATED' and entity_id = (created_p->>'id')::uuid;
  if audit_rec.actor_id <> '00000000-0000-4000-8000-000000000001' or audit_rec.new_values->>'slug' <> 'new-page' then
    raise exception 'PAGE_CREATED audit mismatch';
  end if;

  -- Duplicate slug -> 23505
  begin
    perform public.create_page('{"title":"Dup","slug":"new-page"}'::jsonb);
    raise exception 'duplicate slug accepted in create_page';
  exception when unique_violation then null; end;

  -- 2. Update page
  perform public.update_page((created_p->>'id')::uuid, '{"title":"Updated Title"}'::jsonb);
  if (select title from public.pages where id = (created_p->>'id')::uuid) <> 'Updated Title' then
    raise exception 'update_page title mismatch';
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'PAGE_UPDATED' and entity_id = (created_p->>'id')::uuid;

  -- Missing ID in update -> no_data_found (P0002)
  begin
    perform public.update_page('00000000-0000-4000-8000-000000000999', '{"title":"Ghost"}'::jsonb);
    raise exception 'update missing page succeeded';
  exception when no_data_found then null; end;

  -- 3. Publish page
  perform public.publish_page((created_p->>'id')::uuid);
  if (select status from public.pages where id = (created_p->>'id')::uuid) <> 'PUBLISHED' then
    raise exception 'publish_page status mismatch';
  end if;

  -- 4. Archive page
  perform public.archive_page((created_p->>'id')::uuid);
  if (select status from public.pages where id = (created_p->>'id')::uuid) <> 'ARCHIVED' then
    raise exception 'archive_page status mismatch';
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'PAGE_ARCHIVED' and entity_id = (created_p->>'id')::uuid;

  -- Missing ID in archive -> no_data_found (P0002)
  begin
    perform public.archive_page('00000000-0000-4000-8000-000000000999');
    raise exception 'archive missing page succeeded';
  exception when no_data_found then null; end;

  -- 5. Program CRUD
  created_pr := public.create_program('{"name":"New Prog","slug":"new-prog","display_order":5}'::jsonb);
  if created_pr->>'status' <> 'DRAFT' or (created_pr->>'display_order')::int <> 5 then
    raise exception 'create_program output mismatch';
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'PROGRAM_CREATED' and entity_id = (created_pr->>'id')::uuid;

  perform public.update_program((created_pr->>'id')::uuid, '{"name":"Updated Prog"}'::jsonb);
  select * into strict audit_rec from public.audit_logs where action = 'PROGRAM_UPDATED' and entity_id = (created_pr->>'id')::uuid;

  perform public.publish_program((created_pr->>'id')::uuid);
  if (select status from public.programs where id = (created_pr->>'id')::uuid) <> 'PUBLISHED' then
    raise exception 'publish_program status mismatch';
  end if;

  perform public.archive_program((created_pr->>'id')::uuid);
  if (select status from public.programs where id = (created_pr->>'id')::uuid) <> 'ARCHIVED' then
    raise exception 'archive_program status mismatch';
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'PROGRAM_ARCHIVED' and entity_id = (created_pr->>'id')::uuid;

  -- 6. Website Settings update
  settings_res := public.update_website_settings('{"registration_open":true,"footer_text":"Test Footer"}'::jsonb);
  if jsonb_array_length(settings_res) <> 2 then
    raise exception 'update_website_settings count mismatch';
  end if;

  -- Audit: entity_type = 'website_settings', entity_id IS NULL
  select * into strict audit_rec from public.audit_logs where action = 'SETTING_UPDATED' and new_values->>'key' = 'registration_open';
  if audit_rec.entity_id is not null or audit_rec.actor_id <> '00000000-0000-4000-8000-000000000001' then
    raise exception 'SETTING_UPDATED audit mismatch';
  end if;

  -- Invalid setting key rejected
  begin
    perform public.update_website_settings('{"unknown_key":"bad"}'::jsonb);
    raise exception 'invalid setting key accepted';
  exception when raise_exception then null; end;
end$$;
reset role;

-- Audit failure rolls back mutation
create function public.fail_audit_fixture() returns trigger language plpgsql as $$begin raise exception 'audit failure test';end$$;
create trigger fail_audit_cms before insert on public.audit_logs for each row execute function public.fail_audit_fixture();

select set_config('request.jwt.claims', jsonb_build_object('sub', '00000000-0000-4000-8000-000000000001'::uuid, 'session_id', '00000000-0000-4000-8000-000000000011'::uuid)::text, true);
set local role authenticated;
do $$
begin
  begin
    perform public.create_page('{"title":"Rollback Page","slug":"rollback-page"}'::jsonb);
    raise exception 'create_page succeeded despite audit failure';
  exception when raise_exception then
    if sqlerrm <> 'audit failure test' then raise; end if;
  end;
end$$;
reset role;

drop trigger fail_audit_cms on public.audit_logs;
drop function public.fail_audit_fixture();

do $$
begin
  if exists (select from public.pages where slug = 'rollback-page') then
    raise exception 'page mutation not rolled back on audit failure';
  end if;
end$$;

rollback;
