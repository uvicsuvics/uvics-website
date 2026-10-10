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
  -- D13: tidak ada grant tulis untuk anon/authenticated; service_role penuh
  if exists (
    select from unnest(array['competitions','achievements','achievement_members','projects','project_members']) t,
      unnest(array['anon','authenticated']) r,
      unnest(array['INSERT','UPDATE','DELETE','TRUNCATE']) p
    where has_table_privilege(r, format('public.%I', t), p)
  ) then
    raise exception 'anon/authenticated must not have write privileges on content tables (D13)';
  end if;
  if exists (
    select from unnest(array['competitions','achievements','achievement_members','projects','project_members']) t,
      unnest(array['SELECT','INSERT','UPDATE','DELETE']) p
    where not has_table_privilege('service_role', format('public.%I', t), p)
  ) then
    raise exception 'service_role must keep full access on content tables';
  end if;
  -- D02: dokumen sertifikat privat dan tautan member tidak terbaca anon
  if has_column_privilege('anon', 'public.achievements', 'certificate_file', 'SELECT')
     or has_column_privilege('anon', 'public.achievement_members', 'member_id', 'SELECT')
     or has_column_privilege('anon', 'public.project_members', 'member_id', 'SELECT') then
    raise exception 'anon must not read certificate_file or member_id (D02)';
  end if;
end$$;

-- anon: hanya PUBLISHED; anggota hanya dari induk PUBLISHED
set local role anon;
do $$
begin
  if (select count(*) from public.competitions) <> 1 then raise exception 'anon must see only published competitions'; end if;
  if (select count(*) from public.achievements) <> 1 then raise exception 'anon must see only published achievements'; end if;
  if (select count(*) from public.projects) <> 1 then raise exception 'anon must see only published projects'; end if;
  if (select count(*) from public.achievement_members) <> 2 then raise exception 'anon must see only members of published achievements'; end if;
  if (select count(*) from public.project_members) <> 1 then raise exception 'anon must see only members of published projects'; end if;
end$$;
reset role;

-- authenticated non-admin: sama dengan publik
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002"}', true);
set local role authenticated;
do $$
begin
  if (select count(*) from public.competitions) <> 1 then raise exception 'non-admin must see only published competitions'; end if;
  if (select count(*) from public.achievements) <> 1 then raise exception 'non-admin must see only published achievements'; end if;
  if (select count(*) from public.projects) <> 1 then raise exception 'non-admin must see only published projects'; end if;
  if (select count(*) from public.achievement_members) <> 2 then raise exception 'non-admin must see only members of published achievements'; end if;
  if (select count(*) from public.project_members) <> 1 then raise exception 'non-admin must see only members of published projects'; end if;
end$$;
reset role;

-- admin aktif: membaca draft/arsip, tetapi tidak menulis langsung
select set_config('request.jwt.claims', jsonb_build_object('sub', '00000000-0000-4000-8000-000000000001'::uuid, 'session_id', '00000000-0000-4000-8000-000000000011'::uuid)::text, true);
set local role authenticated;
do $$
begin
  if (select count(*) from public.competitions) <> 4 then raise exception 'active admin must read all competitions'; end if;
  if (select count(*) from public.achievements) <> 3 then raise exception 'active admin must read all achievements'; end if;
  if (select count(*) from public.achievement_members) <> 3 then raise exception 'active admin must read all achievement members'; end if;
  if (select count(*) from public.projects) <> 3 then raise exception 'active admin must read all projects'; end if;
  if (select count(*) from public.project_members) <> 2 then raise exception 'active admin must read all project members'; end if;
  begin
    update public.competitions set featured = true;
    raise exception 'direct competition update must go through an audited RPC (D13)';
  exception when insufficient_privilege then null; end;
end$$;
reset role;

rollback;
