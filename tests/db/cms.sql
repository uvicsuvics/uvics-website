begin;

insert into auth.users (id) values ('00000000-0000-4000-8000-000000000001'), ('00000000-0000-4000-8000-000000000002');
insert into public.admins (id, name, is_active) values ('00000000-0000-4000-8000-000000000001', 'CMS Admin', true);
insert into auth.sessions (id, user_id, created_at) values ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', statement_timestamp());

insert into public.pages (id, title, slug, status) values
  ('00000000-0000-4000-8000-000000000801', 'Draft Page', 'draft-page', 'DRAFT'),
  ('00000000-0000-4000-8000-000000000802', 'Published Page', 'published-page', 'PUBLISHED'),
  ('00000000-0000-4000-8000-000000000803', 'Archived Page', 'archived-page', 'ARCHIVED');
insert into public.programs (id, name, slug, status, image) values
  ('00000000-0000-4000-8000-000000000811', 'Draft Program', 'draft-program', 'DRAFT', '/images/program.png'),
  ('00000000-0000-4000-8000-000000000812', 'Published Program', 'published-program', 'PUBLISHED', null),
  ('00000000-0000-4000-8000-000000000813', 'Archived Program', 'archived-program', 'ARCHIVED', null);
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

-- Grant EXECUTE per role: hosted memberi ALL ke anon/authenticated/service_role (#59),
-- jadi ketujuh RPC runtime harus mencabutnya dari anon dan service_role.
do $$
declare
  fn text;
begin
  foreach fn in array array[
    'public.create_page(jsonb)', 'public.update_page(uuid, jsonb)', 'public.archive_page(uuid)',
    'public.create_program(jsonb)', 'public.update_program(uuid, jsonb)', 'public.archive_program(uuid)',
    'public.update_website_settings(jsonb)'
  ] loop
    if has_function_privilege('anon', fn, 'execute') then raise exception 'anon must not execute %', fn; end if;
    if has_function_privilege('service_role', fn, 'execute') then raise exception 'service_role must not execute %', fn; end if;
    if not has_function_privilege('authenticated', fn, 'execute') then raise exception 'authenticated must execute %', fn; end if;
  end loop;
  if has_function_privilege('anon', 'private.public_setting_is_valid(text, jsonb)', 'execute')
    or has_function_privilege('authenticated', 'private.public_setting_is_valid(text, jsonb)', 'execute')
    or has_function_privilege('service_role', 'private.public_setting_is_valid(text, jsonb)', 'execute') then
    raise exception 'client roles must not execute private.public_setting_is_valid';
  end if;
end$$;

-- service_role tanpa JWT admin ditolak
set local role service_role;
do $$
begin
  perform public.create_page('{"title":"Service","slug":"service-page"}'::jsonb);
  raise exception 'service_role must not create pages';
exception when insufficient_privilege then null;
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
  valid_settings jsonb;
  bad jsonb;
  k text;
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

  -- D44: image tidak ditulis dari admin, walaupun RPC dipanggil langsung
  created_pr := public.create_program('{"name":"A","slug":"a","image":"https://evil.example/x.png"}'::jsonb);
  if created_pr->>'image' is not null then raise exception 'create_program wrote image'; end if;
  perform public.update_program('00000000-0000-4000-8000-000000000811', '{"image":null,"name":"Draft Program 2"}'::jsonb);
  perform public.update_program((created_pr->>'id')::uuid, '{"image":"https://evil.example/y.png"}'::jsonb);
  if (select image from public.programs where id = '00000000-0000-4000-8000-000000000811') is distinct from '/images/program.png'
    or (select image from public.programs where id = (created_pr->>'id')::uuid) is not null then
    raise exception 'update_program changed image';
  end if;

  -- K3: audit update hanya mencatat nama kolom yang berubah, tanpa nilainya
  perform public.update_page('00000000-0000-4000-8000-000000000801', '{"content":"Isi rahasia halaman"}'::jsonb);
  select * into strict audit_rec from public.audit_logs where action = 'PAGE_UPDATED' and entity_id = '00000000-0000-4000-8000-000000000801';
  if audit_rec.new_values->'changed_fields' is distinct from '["content"]'::jsonb
    or audit_rec.old_values ? 'content' or audit_rec.new_values ? 'content'
    or (audit_rec.old_values::text || audit_rec.new_values::text) like '%Isi rahasia%' then
    raise exception 'PAGE_UPDATED changed_fields mismatch: % -> %', audit_rec.old_values, audit_rec.new_values;
  end if;

  perform public.update_program('00000000-0000-4000-8000-000000000813', '{"display_order":7}'::jsonb);
  select * into strict audit_rec from public.audit_logs where action = 'PROGRAM_UPDATED' and entity_id = '00000000-0000-4000-8000-000000000813';
  if audit_rec.new_values <> '{"name":"Archived Program","slug":"archived-program","changed_fields":["display_order"]}'::jsonb
    or audit_rec.old_values <> '{"name":"Archived Program","slug":"archived-program"}'::jsonb then
    raise exception 'PROGRAM_UPDATED changed_fields mismatch: % -> %', audit_rec.old_values, audit_rec.new_values;
  end if;

  -- Update tanpa perubahan: tidak ada UPDATE, tidak ada audit, updated_at tetap
  perform public.update_page('00000000-0000-4000-8000-000000000802',
    '{"title":"Published Page","slug":"published-page","content":"","meta_title":null,"meta_description":null}'::jsonb);
  perform public.update_program('00000000-0000-4000-8000-000000000812',
    '{"name":"Published Program","slug":"published-program","short_description":null,"description":"","display_order":0}'::jsonb);
  if exists (select from public.audit_logs where entity_id in ('00000000-0000-4000-8000-000000000802', '00000000-0000-4000-8000-000000000812'))
    or (select updated_at from public.pages where id = '00000000-0000-4000-8000-000000000802') <> (select created_at from public.pages where id = '00000000-0000-4000-8000-000000000802')
    or (select updated_at from public.programs where id = '00000000-0000-4000-8000-000000000812') <> (select created_at from public.programs where id = '00000000-0000-4000-8000-000000000812') then
    raise exception 'no-op update wrote a row or an audit entry';
  end if;

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
  exception when sqlstate '23514' then null; end;

  -- Setiap key yang bisa diedit admin dan tersimpan juga tampil di reader publik
  valid_settings := jsonb_build_object(
    'organization_name', 'UVICS', 'website_title', 'UVICS Website', 'email', 'uvics@unklab.ac.id',
    'phone', '+6281234567890', 'address', 'Airmadidi, Minahasa Utara',
    'instagram_url', 'https://www.instagram.com/uvics', 'linkedin_url', 'https://www.linkedin.com/company/uvics',
    'github_url', 'https://github.com/uvics', 'youtube_url', 'https://www.youtube.com/@uvics',
    'footer_text', 'Hak cipta UVICS', 'default_meta_title', 'UVICS', 'default_meta_description', 'Komunitas CS UNKLAB',
    'registration_open', true, 'maintenance_mode', false);
  perform public.update_website_settings(valid_settings);
  for k in select jsonb_object_keys(valid_settings) loop
    if not (public.read_public_settings() ? k) then raise exception 'stored setting % hidden from public reader', k; end if;
  end loop;

  -- Nilai yang lolos Zod tapi gagal reader publik ditolak
  foreach bad in array array[
    '{"organization_name":"   "}', '{"organization_name":"!!!"}',
    '{"github_url":"https://github.com:8443/uvics"}', '{"github_url":"https://xn--uvics-9ta.com/x"}'
  ]::jsonb[] loop
    begin
      perform public.update_website_settings(bad);
      raise exception 'setting rejected by the public reader was stored: %', bad;
    exception when sqlstate '23514' then null; end;
  end loop;

  -- K2: null mengosongkan key teks; key yang tidak dikirim tidak disentuh
  perform public.update_website_settings('{"footer_text":null}'::jsonb);
  if public.read_public_settings() ? 'footer_text'
    or (select value from public.website_settings where key = 'footer_text') <> 'null'::jsonb then
    raise exception 'footer_text null did not clear the setting';
  end if;
  if public.read_public_settings()->>'organization_name' <> 'UVICS' then
    raise exception 'unsent setting key was changed';
  end if;

  -- K2: identitas wajib dan flag boolean tidak boleh null
  foreach bad in array array['{"registration_open":null}', '{"organization_name":null}']::jsonb[] loop
    begin
      perform public.update_website_settings(bad);
      raise exception 'required setting cleared: %', bad;
    exception when sqlstate '23514' then null; end;
  end loop;
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
