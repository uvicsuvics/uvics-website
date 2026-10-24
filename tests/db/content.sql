begin;

insert into auth.users (id) values ('00000000-0000-4000-8000-000000000001'), ('00000000-0000-4000-8000-000000000002');
insert into public.admins (id, name, is_active) values ('00000000-0000-4000-8000-000000000001', 'Content Admin', true);
insert into auth.sessions (id, user_id, created_at) values ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', statement_timestamp());

insert into public.members (id, full_name) values ('00000000-0000-4000-8000-000000000701', 'Achievement Member'), ('00000000-0000-4000-8000-000000000702', 'Project Member');
insert into public.competitions (id, title, slug, organizer, status, publication_status) values
  ('00000000-0000-4000-8000-000000000711', 'Published Comp', 'published-comp', 'Org', 'OPEN', 'PUBLISHED'),
  ('00000000-0000-4000-8000-000000000712', 'Draft Comp', 'draft-comp', 'Org', 'OPEN', 'DRAFT'),
  ('00000000-0000-4000-8000-000000000713', 'Archived Comp', 'archived-comp', 'Org', 'FINISHED', 'ARCHIVED');
insert into public.achievements (id, title, slug, competition_name, ranking, achievement_date, publication_status) values
  ('00000000-0000-4000-8000-000000000721', 'Published Ach', 'published-ach', 'Comp', 'Juara 1', '2026-01-01', 'PUBLISHED'),
  ('00000000-0000-4000-8000-000000000722', 'Draft Ach', 'draft-ach', 'Comp', 'Juara 2', '2026-01-02', 'DRAFT'),
  ('00000000-0000-4000-8000-000000000723', 'Archived Ach', 'archived-ach', 'Comp', 'Juara 3', '2026-01-03', 'ARCHIVED');
insert into public.achievement_certificates (achievement_id, certificate_file) values
  ('00000000-0000-4000-8000-000000000721', 'uvics/private/certificate-721');
insert into public.achievement_members (achievement_id, member_id, member_name, role) values
  ('00000000-0000-4000-8000-000000000721', '00000000-0000-4000-8000-000000000701', null, 'Ketua'),
  ('00000000-0000-4000-8000-000000000721', null, 'Peserta Luar', 'Anggota'),
  ('00000000-0000-4000-8000-000000000722', null, 'Peserta Draft', null);
insert into public.projects (id, title, slug, summary, status, publication_status) values
  ('00000000-0000-4000-8000-000000000731', 'Published Proj', 'published-proj', 'Ringkasan', 'ARCHIVED', 'PUBLISHED'),
  ('00000000-0000-4000-8000-000000000732', 'Draft Proj', 'draft-proj', 'Ringkasan', 'PLANNED', 'DRAFT'),
  ('00000000-0000-4000-8000-000000000733', 'Archived Proj', 'archived-proj', 'Ringkasan', 'COMPLETED', 'ARCHIVED');
insert into public.project_members (project_id, member_id, member_name) values
  ('00000000-0000-4000-8000-000000000731', '00000000-0000-4000-8000-000000000702', null),
  ('00000000-0000-4000-8000-000000000732', null, 'Kontributor Draft');

-- Constraint (sebagai pemilik tabel)
do $$
begin
  insert into public.competitions (title, slug, organizer) values ('Default', 'default-comp', 'Org');
  if (select publication_status from public.competitions where slug = 'default-comp') <> 'DRAFT' then
    raise exception 'new content must default to DRAFT (D17)';
  end if;
  begin
    insert into public.competitions (title, slug, organizer, registration_deadline, competition_date) values ('Late', 'late-comp', 'Org', '2026-02-02', '2026-02-01');
    raise exception 'registration_deadline after competition_date accepted';
  exception when check_violation then null; end;
  begin
    insert into public.competitions (title, slug, organizer, registration_url) values ('Xss', 'xss-comp', 'Org', 'javascript:alert(1)');
    raise exception 'non-http registration_url accepted';
  exception when check_violation then null; end;
  begin
    insert into public.projects (title, slug, summary, repository_url) values ('Xss', 'xss-proj', 'S', 'data:text/html,x');
    raise exception 'non-http repository_url accepted';
  exception when check_violation then null; end;
  begin
    insert into public.competitions (title, slug, organizer, guidebook_url) values ('Xss', 'xss-guide', 'Org', 'javascript:alert(1)');
    raise exception 'non-http guidebook_url accepted';
  exception when check_violation then null; end;
  begin
    insert into public.projects (title, slug, summary, project_url) values ('Xss', 'xss-site', 'S', 'javascript:alert(1)');
    raise exception 'non-http project_url accepted';
  exception when check_violation then null; end;
  begin
    insert into public.projects (title, slug, summary, start_date, end_date) values ('Late', 'late-proj', 'S', '2026-02-02', '2026-02-01');
    raise exception 'project start_date after end_date accepted';
  exception when check_violation then null; end;
  begin
    insert into public.competitions (title, slug, organizer) values ('Dup', 'published-comp', 'Org');
    raise exception 'duplicate slug accepted';
  exception when unique_violation then null; end;
  begin
    insert into public.achievements (title, slug, competition_name, ranking, achievement_date) values ('Bad', 'Bad Slug', 'C', '1', '2026-01-01');
    raise exception 'invalid slug accepted';
  exception when check_violation then null; end;
  -- U17: level memakai kode baku content_level
  begin
    insert into public.competitions (title, slug, organizer, level) values ('Lvl', 'lvl-comp', 'Org', 'Nasional');
    raise exception 'free-text competition level accepted';
  exception when invalid_text_representation then null; end;
  begin
    insert into public.achievements (title, slug, competition_name, ranking, achievement_date, level) values ('Lvl', 'lvl-ach', 'C', '1', '2026-01-01', 'National');
    raise exception 'free-text achievement level accepted';
  exception when invalid_text_representation then null; end;
  -- Kolom media berisi referensi, maksimal 500 karakter
  begin
    insert into public.competitions (title, slug, organizer, poster) values ('Media', 'media-comp', 'Org', repeat('a', 501));
    raise exception 'poster longer than 500 accepted';
  exception when check_violation then null; end;
  begin
    insert into public.achievements (title, slug, competition_name, ranking, achievement_date, cover_image) values ('Media', 'media-ach', 'C', '1', '2026-01-01', repeat('a', 501));
    raise exception 'achievement cover_image longer than 500 accepted';
  exception when check_violation then null; end;
  begin
    insert into public.projects (title, slug, summary, cover_image) values ('Media', 'media-proj', 'S', repeat('a', 501));
    raise exception 'project cover_image longer than 500 accepted';
  exception when check_violation then null; end;
  -- Batas panjang field (sama dengan Zod)
  declare
    r record;
  begin
    for r in select * from (values
      ('achievement organizer > 255', $s$insert into public.achievements (title, slug, competition_name, ranking, achievement_date, organizer) values ('L', 'len-1', 'C', '1', '2026-01-01', repeat('a', 256))$s$),
      ('competition category > 120', $s$insert into public.competitions (title, slug, organizer, category) values ('L', 'len-2', 'Org', repeat('a', 121))$s$),
      ('competition team_size > 100', $s$insert into public.competitions (title, slug, organizer, team_size) values ('L', 'len-3', 'Org', repeat('a', 101))$s$),
      ('competition eligibility > 2000', $s$insert into public.competitions (title, slug, organizer, eligibility) values ('L', 'len-4', 'Org', repeat('a', 2001))$s$),
      ('achievement ranking > 120', $s$insert into public.achievements (title, slug, competition_name, ranking, achievement_date) values ('L', 'len-5', 'C', repeat('a', 121), '2026-01-01')$s$),
      ('empty achievement ranking', $s$insert into public.achievements (title, slug, competition_name, ranking, achievement_date) values ('L', 'len-6', 'C', '', '2026-01-01')$s$),
      ('achievement member role > 120', $s$insert into public.achievement_members (achievement_id, member_name, role) values ('00000000-0000-4000-8000-000000000721', 'X', repeat('a', 121))$s$),
      ('project member role > 120', $s$insert into public.project_members (project_id, member_name, role) values ('00000000-0000-4000-8000-000000000731', 'X', repeat('a', 121))$s$),
      ('competition description > 20000', $s$insert into public.competitions (title, slug, organizer, description) values ('L', 'len-9', 'Org', repeat('a', 20001))$s$),
      ('achievement description > 20000', $s$insert into public.achievements (title, slug, competition_name, ranking, achievement_date, description) values ('L', 'len-10', 'C', '1', '2026-01-01', repeat('a', 20001))$s$),
      ('project description > 20000', $s$insert into public.projects (title, slug, summary, description) values ('L', 'len-11', 'S', repeat('a', 20001))$s$),
      ('blank project summary', $s$insert into public.projects (title, slug, summary) values ('L', 'len-12', '   ')$s$),
      ('project summary > 500', $s$insert into public.projects (title, slug, summary) values ('L', 'len-13', repeat('a', 501))$s$)
    ) v(label, stmt) loop
      begin
        execute r.stmt;
        raise exception '% accepted', r.label;
      exception when check_violation then null; end;
    end loop;
  end;
  -- D18
  begin
    insert into public.achievement_members (achievement_id) values ('00000000-0000-4000-8000-000000000721');
    raise exception 'member row without member_id and member_name accepted';
  exception when check_violation then null; end;
  begin
    insert into public.project_members (project_id, member_name) values ('00000000-0000-4000-8000-000000000731', null);
    raise exception 'project member without member_id and member_name accepted';
  exception when check_violation then null; end;
  begin
    insert into public.achievement_members (achievement_id, member_id) values ('00000000-0000-4000-8000-000000000721', '00000000-0000-4000-8000-0000000007ff');
    raise exception 'unknown member_id accepted';
  exception when foreign_key_violation then null; end;
  begin
    insert into public.achievement_members (achievement_id, member_id) values ('00000000-0000-4000-8000-000000000721', '00000000-0000-4000-8000-000000000701');
    raise exception 'same member linked twice to one achievement';
  exception when unique_violation then null; end;
  -- PostgreSQL 18 melempar restrict_violation untuk ON DELETE RESTRICT; versi 17 (CI) foreign_key_violation.
  begin
    delete from public.members where id = '00000000-0000-4000-8000-000000000701';
    raise exception 'member linked to an achievement hard-deleted (D14)';
  exception when foreign_key_violation or restrict_violation then null; end;
  begin
    delete from public.members where id = '00000000-0000-4000-8000-000000000702';
    raise exception 'member linked to a project hard-deleted (D14)';
  exception when foreign_key_violation or restrict_violation then null; end;
  begin
    insert into public.project_members (project_id, member_id) values ('00000000-0000-4000-8000-000000000731', '00000000-0000-4000-8000-000000000702');
    raise exception 'same member linked twice to one project';
  exception when unique_violation then null; end;
  -- U18: certificate_file pindah ke tabel khusus admin
  if exists (select from information_schema.columns where table_schema = 'public' and table_name = 'achievements' and column_name = 'certificate_file') then
    raise exception 'certificate_file must not live on public achievements (U18)';
  end if;
  begin
    insert into public.achievement_certificates (achievement_id, certificate_file) values ('00000000-0000-4000-8000-000000000722', '');
    raise exception 'empty certificate_file accepted';
  exception when check_violation then null; end;
  begin
    insert into public.achievement_certificates (achievement_id, certificate_file) values ('00000000-0000-4000-8000-000000000722', repeat('a', 501));
    raise exception 'certificate_file longer than 500 accepted';
  exception when check_violation then null; end;
  if has_table_privilege('anon', 'public.achievement_certificates', 'SELECT') then
    raise exception 'anon must not read achievement_certificates (D02)';
  end if;
  -- D13: tidak ada grant tulis untuk anon/authenticated; service_role penuh
  if exists (
    select from unnest(array['competitions','achievements','achievement_certificates','achievement_members','projects','project_members']) t,
      unnest(array['anon','authenticated']) r,
      unnest(array['INSERT','UPDATE','DELETE','TRUNCATE']) p
    where has_table_privilege(r, format('public.%I', t), p)
  ) then
    raise exception 'anon/authenticated must not have write privileges on content tables (D13)';
  end if;
  -- D13/#31: service_role melewati RLS, jadi DML langsung = mutation tanpa audit. Hanya SELECT.
  if exists (
    select from unnest(array['competitions','achievements','achievement_certificates','achievement_members','projects','project_members']) t
    where not has_table_privilege('service_role', format('public.%I', t), 'SELECT')
      or has_table_privilege('service_role', format('public.%I', t), 'INSERT')
      or has_table_privilege('service_role', format('public.%I', t), 'UPDATE')
      or has_table_privilege('service_role', format('public.%I', t), 'DELETE')
  ) then
    raise exception 'service_role must have SELECT only on content tables (D13)';
  end if;
  -- D02 & D21: tautan member_id tidak terbaca anon maupun authenticated non-admin secara langsung
  if has_column_privilege('anon', 'public.achievement_members', 'member_id', 'SELECT')
     or has_column_privilege('anon', 'public.project_members', 'member_id', 'SELECT') then
    raise exception 'anon must not read member_id (D02)';
  end if;
  if has_column_privilege('authenticated', 'public.achievement_members', 'member_id', 'SELECT')
     or has_column_privilege('authenticated', 'public.project_members', 'member_id', 'SELECT') then
    raise exception 'authenticated direct table select on member_id must be revoked (D21)';
  end if;
end$$;

-- anon: hanya PUBLISHED; anggota hanya dari induk PUBLISHED; RPC mutasi ditolak
set local role anon;
do $$
begin
  if (select count(*) from public.competitions) <> 1 then raise exception 'anon must see only published competitions'; end if;
  if (select count(*) from public.achievements) <> 1 then raise exception 'anon must see only published achievements'; end if;
  if (select count(*) from public.projects) <> 1 then raise exception 'anon must see only published projects'; end if;
  if (select count(*) from public.achievement_members) <> 2 then raise exception 'anon must see only members of published achievements'; end if;
  if (select count(*) from public.project_members) <> 1 then raise exception 'anon must see only members of published projects'; end if;

  begin
    perform public.create_competition('{"title":"X","slug":"x","organizer":"X"}'::jsonb);
    raise exception 'anon must not execute create_competition';
  exception when insufficient_privilege then null; end;
  begin
    perform public.publish_competition('00000000-0000-4000-8000-000000000712'::uuid);
    raise exception 'anon must not execute publish_competition';
  exception when insufficient_privilege then null; end;
  begin
    perform public.delete_competition('00000000-0000-4000-8000-000000000712'::uuid);
    raise exception 'anon must not execute delete_competition';
  exception when insufficient_privilege then null; end;
end$$;
reset role;

-- authenticated non-admin: baris sama dengan publik; sertifikat dan member_id tidak terbaca (D21 ditutup)
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002"}', true);
set local role authenticated;
do $$
begin
  if (select count(*) from public.competitions) <> 1 then raise exception 'non-admin must see only published competitions'; end if;
  if (select count(*) from public.achievements) <> 1 then raise exception 'non-admin must see only published achievements'; end if;
  if (select count(*) from public.projects) <> 1 then raise exception 'non-admin must see only published projects'; end if;
  if (select count(*) from public.achievement_members) <> 2 then raise exception 'non-admin must see only members of published achievements'; end if;
  if (select count(*) from public.project_members) <> 1 then raise exception 'non-admin must see only members of published projects'; end if;
  if (select count(*) from public.achievement_certificates) <> 0 then raise exception 'non-admin must not read achievement certificates'; end if;

  -- D21: non-admin tidak membaca member_id langsung dari tabel
  begin
    perform member_id from public.achievement_members;
    raise exception 'non-admin must not read member_id directly from achievement_members (D21)';
  exception when insufficient_privilege then null; end;

  begin
    perform member_id from public.project_members;
    raise exception 'non-admin must not read member_id directly from project_members (D21)';
  exception when insufficient_privilege then null; end;

  -- D21: admin view mengembalikan 0 baris untuk non-admin
  if (select count(*) from public.admin_achievement_members) <> 0 then raise exception 'non-admin must see 0 rows in admin_achievement_members'; end if;
  if (select count(*) from public.admin_project_members) <> 0 then raise exception 'non-admin must see 0 rows in admin_project_members'; end if;

  -- Non-admin ditolak saat memanggil RPC mutasi
  begin
    perform public.create_competition('{"title":"X","slug":"x","organizer":"X"}'::jsonb);
    raise exception 'non-admin must not execute create_competition';
  exception when insufficient_privilege then null; end;
  begin
    perform public.publish_competition('00000000-0000-4000-8000-000000000712'::uuid);
    raise exception 'non-admin must not execute publish_competition';
  exception when insufficient_privilege then null; end;
  begin
    perform public.delete_competition('00000000-0000-4000-8000-000000000712'::uuid);
    raise exception 'non-admin must not execute delete_competition';
  exception when insufficient_privilege then null; end;
  begin
    perform public.get_admin_achievement('00000000-0000-4000-8000-000000000721'::uuid);
    raise exception 'non-admin must not execute get_admin_achievement';
  exception when insufficient_privilege then null; end;
end$$;
reset role;

-- Fixtures media intents untuk pengujian validasi media di mutasi admin
insert into private.upload_intents (
  id, owner_id, category, kind, public_id, preset, max_bytes,
  issued_at, expires_at, cleanup_not_before, status,
  asset_id, version, format, bytes, width, height
) values
  ('00000000-0000-4000-8000-000000000901', '00000000-0000-4000-8000-000000000001', 'poster', 'image', 'uvics/pending/00000000-0000-4000-8000-000000000901', 'uvics_image_5mb_v1', 5242880, statement_timestamp(), statement_timestamp() + interval '1 hour', statement_timestamp() + interval '65 minutes', 'COMPLETED', 'asset-poster-901', 1, 'png', 1000, 100, 100),
  ('00000000-0000-4000-8000-000000000902', '00000000-0000-4000-8000-000000000001', 'thumbnail', 'image', 'uvics/pending/00000000-0000-4000-8000-000000000902', 'uvics_image_5mb_v1', 5242880, statement_timestamp(), statement_timestamp() + interval '1 hour', statement_timestamp() + interval '65 minutes', 'COMPLETED', 'asset-thumb-902', 1, 'jpg', 1000, 100, 100),
  ('00000000-0000-4000-8000-000000000903', '00000000-0000-4000-8000-000000000001', 'certificate', 'pdf', 'uvics/pending/00000000-0000-4000-8000-000000000903', 'uvics_pdf_10mb_v1', 10485760, statement_timestamp(), statement_timestamp() + interval '1 hour', statement_timestamp() + interval '65 minutes', 'COMPLETED', 'asset-cert-903', 1, 'pdf', 5000, 0, 0),
  ('00000000-0000-4000-8000-000000000904', '00000000-0000-4000-8000-000000000001', 'poster', 'image', 'uvics/pending/00000000-0000-4000-8000-000000000904', 'uvics_image_5mb_v1', 5242880, statement_timestamp(), statement_timestamp() + interval '1 hour', statement_timestamp() + interval '65 minutes', 'PENDING', null, null, null, null, null, null);

-- admin aktif: membaca draft/arsip, mutasi lewat RPC ter-audit, validasi media, penutupan D21
select set_config('request.jwt.claims', jsonb_build_object('sub', '00000000-0000-4000-8000-000000000001'::uuid, 'session_id', '00000000-0000-4000-8000-000000000011'::uuid)::text, true);
set local role authenticated;
do $$
declare
  c_res jsonb;
  c_id uuid;
  a_res jsonb;
  a_id uuid;
  p_res jsonb;
  p_id uuid;
  audit_rec public.audit_logs;
  admin_ach jsonb;
  admin_proj jsonb;
begin
  -- 1. Verifikasi pembacaan awal admin aktif
  if (select count(*) from public.competitions) <> 4 then raise exception 'active admin must read all competitions'; end if;
  if (select count(*) from public.achievements) <> 3 then raise exception 'active admin must read all achievements'; end if;
  if (select count(*) from public.projects) <> 3 then raise exception 'active admin must read all projects'; end if;
  if (select count(*) from public.achievement_certificates) <> 1 then raise exception 'active admin must read achievement certificates'; end if;

  -- D21: admin membaca view admin_achievement_members dan admin_project_members lengkap dengan member_id
  if (select count(*) from public.admin_achievement_members) <> 3 then raise exception 'admin must read all rows from admin_achievement_members'; end if;
  if (select count(*) from public.admin_achievement_members where member_id is not null) <> 1 then raise exception 'admin must see member_id in admin_achievement_members'; end if;
  if (select count(*) from public.admin_project_members) <> 2 then raise exception 'admin must read all rows from admin_project_members'; end if;

  -- D13: direct update tetap dilarang
  begin
    update public.competitions set featured = true;
    raise exception 'direct competition update must go through an audited RPC (D13)';
  exception when insufficient_privilege then null; end;

  -- 2. Competitions: Create -> Invalid Media -> Update -> Publish -> Delete
  -- Validasi media: intent berstatus PENDING harus ditolak
  begin
    perform public.create_competition(jsonb_build_object(
      'title', 'Pending Poster Comp',
      'slug', 'pending-poster-comp',
      'organizer', 'Org',
      'poster', '00000000-0000-4000-8000-000000000904'
    ));
    raise exception 'pending upload intent accepted for poster';
  exception when sqlstate '22023' then null; end;

  -- Create competition dengan media COMPLETED
  c_res := public.create_competition(jsonb_build_object(
    'title', 'New Audited Comp',
    'slug', 'new-audited-comp',
    'organizer', 'Himpunan',
    'level', 'NASIONAL',
    'poster', '00000000-0000-4000-8000-000000000901',
    'featured', true
  ));
  c_id := (c_res->>'id')::uuid;

  select * into strict audit_rec from public.audit_logs
  where action = 'COMPETITION_CREATED' and entity_id = c_id;
  if audit_rec.actor_id <> '00000000-0000-4000-8000-000000000001'
     or audit_rec.new_values->>'slug' <> 'new-audited-comp' then
    raise exception 'COMPETITION_CREATED audit log mismatch';
  end if;

  -- Update competition
  c_res := public.update_competition(c_id, jsonb_build_object(
    'title', 'Updated Audited Comp',
    'description', 'Deskripsi lomba'
  ));
  if (select title from public.competitions where id = c_id) <> 'Updated Audited Comp' then
    raise exception 'update_competition title failed';
  end if;
  select * into strict audit_rec from public.audit_logs
  where action = 'COMPETITION_UPDATED' and entity_id = c_id;
  if audit_rec.old_values->>'title' <> 'New Audited Comp' or audit_rec.new_values->>'title' <> 'Updated Audited Comp' then
    raise exception 'COMPETITION_UPDATED audit log mismatch';
  end if;

  -- Publish competition
  perform public.publish_competition(c_id);
  if (select publication_status from public.competitions where id = c_id) <> 'PUBLISHED' then
    raise exception 'publish_competition failed';
  end if;
  select * into strict audit_rec from public.audit_logs
  where action = 'COMPETITION_PUBLISHED' and entity_id = c_id;

  -- Delete competition
  perform public.delete_competition(c_id);
  if exists (select from public.competitions where id = c_id) then
    raise exception 'delete_competition failed';
  end if;
  select * into strict audit_rec from public.audit_logs
  where action = 'COMPETITION_DELETED' and entity_id = c_id;

  -- 3. Achievements: Create (dengan cover_image, certificate_file, members) -> Update -> Publish -> Delete
  -- Validasi media sertifikat: kategori bukan certificate harus ditolak
  begin
    perform public.create_achievement(jsonb_build_object(
      'title', 'Bad Cert Ach',
      'slug', 'bad-cert-ach',
      'competition_name', 'Lomba',
      'ranking', '1',
      'achievement_date', '2026-03-01',
      'certificate_file', '00000000-0000-4000-8000-000000000901' -- poster, bukan certificate
    ));
    raise exception 'poster category accepted for certificate';
  exception when sqlstate '22023' then null; end;

  a_res := public.create_achievement(jsonb_build_object(
    'title', 'New Audited Ach',
    'slug', 'new-audited-ach',
    'competition_name', 'Gemastik',
    'ranking', 'Juara 1',
    'achievement_date', '2026-03-01',
    'cover_image', '00000000-0000-4000-8000-000000000902',
    'certificate_file', '00000000-0000-4000-8000-000000000903',
    'members', jsonb_build_array(
      jsonb_build_object('member_id', '00000000-0000-4000-8000-000000000701', 'role', 'Leader'),
      jsonb_build_object('member_name', 'Peserta Eksternal', 'role', 'Member')
    )
  ));
  a_id := (a_res->>'id')::uuid;

  select * into strict audit_rec from public.audit_logs
  where action = 'ACHIEVEMENT_CREATED' and entity_id = a_id;

  -- Verifikasi relasi sertifikat dan members
  if (select certificate_file from public.achievement_certificates where achievement_id = a_id) <> '00000000-0000-4000-8000-000000000903' then
    raise exception 'achievement_certificates insert failed';
  end if;
  if (select count(*) from public.achievement_members where achievement_id = a_id) <> 2 then
    raise exception 'achievement_members insert failed';
  end if;

  -- get_admin_achievement mengembalikan detail lengkap dengan certificate dan members
  admin_ach := public.get_admin_achievement(a_id);
  if admin_ach->>'certificate_file' <> '00000000-0000-4000-8000-000000000903'
     or jsonb_array_length(admin_ach->'members') <> 2 then
    raise exception 'get_admin_achievement result mismatch';
  end if;

  -- Update achievement
  a_res := public.update_achievement(a_id, jsonb_build_object(
    'ranking', 'Juara Umum',
    'members', jsonb_build_array(
      jsonb_build_object('member_id', '00000000-0000-4000-8000-000000000701', 'role', 'Solo')
    )
  ));
  if (select count(*) from public.achievement_members where achievement_id = a_id) <> 1 then
    raise exception 'achievement_members replace update failed';
  end if;
  select * into strict audit_rec from public.audit_logs
  where action = 'ACHIEVEMENT_UPDATED' and entity_id = a_id;

  -- Publish achievement
  perform public.publish_achievement(a_id);
  if (select publication_status from public.achievements where id = a_id) <> 'PUBLISHED' then
    raise exception 'publish_achievement failed';
  end if;
  select * into strict audit_rec from public.audit_logs
  where action = 'ACHIEVEMENT_PUBLISHED' and entity_id = a_id;

  -- Delete achievement (cascade ke sertifikat dan anggota)
  perform public.delete_achievement(a_id);
  if exists (select from public.achievements where id = a_id)
     or exists (select from public.achievement_certificates where achievement_id = a_id)
     or exists (select from public.achievement_members where achievement_id = a_id) then
    raise exception 'delete_achievement cascade failed';
  end if;
  select * into strict audit_rec from public.audit_logs
  where action = 'ACHIEVEMENT_DELETED' and entity_id = a_id;

  -- 4. Projects: Create -> Update -> Publish -> Delete
  p_res := public.create_project(jsonb_build_object(
    'title', 'New Audited Project',
    'slug', 'new-audited-project',
    'summary', 'Ringkasan proyek ter-audit',
    'cover_image', '00000000-0000-4000-8000-000000000902',
    'members', jsonb_build_array(
      jsonb_build_object('member_id', '00000000-0000-4000-8000-000000000702', 'role', 'Lead Developer')
    )
  ));
  p_id := (p_res->>'id')::uuid;

  select * into strict audit_rec from public.audit_logs
  where action = 'PROJECT_CREATED' and entity_id = p_id;

  admin_proj := public.get_admin_project(p_id);
  if admin_proj->>'title' <> 'New Audited Project'
     or jsonb_array_length(admin_proj->'members') <> 1 then
    raise exception 'get_admin_project result mismatch';
  end if;

  -- Update project
  p_res := public.update_project(p_id, jsonb_build_object(
    'title', 'Updated Project Title'
  ));
  select * into strict audit_rec from public.audit_logs
  where action = 'PROJECT_UPDATED' and entity_id = p_id;

  -- Publish project
  perform public.publish_project(p_id);
  if (select publication_status from public.projects where id = p_id) <> 'PUBLISHED' then
    raise exception 'publish_project failed';
  end if;
  select * into strict audit_rec from public.audit_logs
  where action = 'PROJECT_PUBLISHED' and entity_id = p_id;

  -- Delete project
  perform public.delete_project(p_id);
  if exists (select from public.projects where id = p_id)
     or exists (select from public.project_members where project_id = p_id) then
    raise exception 'delete_project cascade failed';
  end if;
  select * into strict audit_rec from public.audit_logs
  where action = 'PROJECT_DELETED' and entity_id = p_id;

  -- 5. P0002 saat ID tidak ditemukan
  begin
    perform public.publish_competition(gen_random_uuid());
    raise exception 'missing competition reported success';
  exception when no_data_found then null; end;

  begin
    perform public.update_achievement(gen_random_uuid(), '{"title":"X"}'::jsonb);
    raise exception 'missing achievement update reported success';
  exception when no_data_found then null; end;

  begin
    perform public.delete_project(gen_random_uuid());
    raise exception 'missing project delete reported success';
  exception when no_data_found then null; end;
end$$;
reset role;

-- 6. Atomisitas: Kegagalan audit membatalkan mutasi konten
create function public.fail_content_audit_fixture() returns trigger language plpgsql as $$
begin
  raise exception 'content audit fixture failure';
end$$;
create trigger fail_content_audit_fixture before insert on public.audit_logs for each row execute function public.fail_content_audit_fixture();

select set_config('request.jwt.claims', jsonb_build_object('sub', '00000000-0000-4000-8000-000000000001'::uuid, 'session_id', '00000000-0000-4000-8000-000000000011'::uuid)::text, true);
set local role authenticated;
do $$
begin
  begin
    perform public.create_competition(jsonb_build_object(
      'title', 'Rollback Comp',
      'slug', 'rollback-comp',
      'organizer', 'Org'
    ));
    raise exception 'create_competition without audit succeeded';
  exception when raise_exception then
    if sqlerrm <> 'content audit fixture failure' then raise; end if;
  end;
end$$;
reset role;
drop trigger fail_content_audit_fixture on public.audit_logs;
drop function public.fail_content_audit_fixture();

do $$
begin
  if exists (select from public.competitions where slug = 'rollback-comp') then
    raise exception 'competition mutation was not rolled back upon audit failure';
  end if;
end$$;

rollback;

