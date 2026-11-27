begin;

-- Seed synthetic auth fixture for testing RLS policies and audited admin RPCs
insert into auth.users (id) values
  ('00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000002');
insert into public.admins (id, name, is_active) values
  ('00000000-0000-4000-8000-000000000001', 'Synthetic Admin', true);
insert into auth.sessions (id, user_id, created_at) values
  ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', statement_timestamp()),
  ('00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000001', statement_timestamp() - interval '2 hours');

-- Helper: jalankan SQL dan wajibkan error dengan SQLSTATE tertentu.
create function pg_temp.expect_error(sql text, code text, label text) returns void language plpgsql as $$
begin
  begin
    execute sql;
  exception when others then
    if sqlstate = code then
      return;
    end if;
    raise exception '% GAGAL: harus %, dapat % (%)', label, code, sqlstate, sqlerrm;
  end;
  raise exception '% GAGAL: harus %, tetapi berhasil', label, code;
end$$;

do $$
declare
  d uuid;
  p uuid;
  o uuid;
  m uuid;
  h uuid;
begin
  insert into public.departments (name, slug) values ('UI/UX', 'ui-ux') returning id into d;
  insert into public.positions (name, level) values ('Member', 'MEMBER') returning id into p;
  insert into public.organization_periods (name, start_date, end_date, status) values ('2024/2025', '2024-08-01', '2025-07-31', 'ACTIVE') returning id into o;
  insert into public.members (full_name) values ('Test Member') returning id into m;

  insert into public.membership_histories (member_id, organization_period_id, department_id, position_id, start_date)
  values (m, o, d, p, '2024-08-15') returning id into h;

  -- Simpan fixture ID untuk pengujian RPC admin di bawah
  perform set_config('test.dept_ref', d::text, true);
  perform set_config('test.pos_ref', p::text, true);
  perform set_config('test.period_active', o::text, true);
  perform set_config('test.member_active', m::text, true);
  perform set_config('test.history_ref', h::text, true);

  -- ==============================================================
  -- TEST D: Delete guards (ON DELETE RESTRICT)
  -- ==============================================================
  begin
    delete from public.departments where id = d;
    raise exception 'department delete guard failed';
  exception when foreign_key_violation or restrict_violation or sqlstate '23001' then
    null; -- Expected
  end;

  begin
    delete from public.positions where id = p;
    raise exception 'position delete guard failed';
  exception when foreign_key_violation or restrict_violation or sqlstate '23001' then
    null; -- Expected
  end;

  begin
    delete from public.organization_periods where id = o;
    raise exception 'organization period delete guard failed';
  exception when foreign_key_violation or restrict_violation or sqlstate '23001' then
    null; -- Expected
  end;

  begin
    delete from public.members where id = m;
    raise exception 'member delete guard failed';
  exception when foreign_key_violation or restrict_violation or sqlstate '23001' then
    null; -- Expected
  end;

  -- ==============================================================
  -- TEST A: Single active period enforcement
  -- ==============================================================
  begin
    insert into public.organization_periods (name, start_date, end_date, status)
    values ('2025/2026', '2025-08-01', '2026-07-31', 'ACTIVE');
    raise exception 'second active period should have been rejected';
  exception when unique_violation then
    null; -- Expected
  end;

  insert into public.organization_periods (name, start_date, end_date, status)
  values ('2023/2024', '2023-08-01', '2024-07-31', 'ENDED');

  -- ==============================================================
  -- TEST B: Date consistency (start_date <= end_date)
  -- ==============================================================
  insert into public.organization_periods (name, start_date, end_date, status)
  values ('Single Day', '2025-01-01', '2025-01-01', 'UPCOMING');

  begin
    insert into public.organization_periods (name, start_date, end_date, status)
    values ('Invalid Dates', '2025-08-01', '2024-07-31', 'UPCOMING');
    raise exception 'end_date < start_date should have been rejected';
  exception when check_violation then
    null; -- Expected
  end;

  -- ==============================================================
  -- TEST C: Department slug validation
  -- ==============================================================
  insert into public.departments (name, slug) values ('Software Eng', 'software-eng');

  begin
    insert into public.departments (name, slug) values ('Duplicate Slug', 'ui-ux');
    raise exception 'duplicate slug should have been rejected';
  exception when unique_violation then
    null; -- Expected
  end;

  begin
    insert into public.departments (name, slug) values ('Upper Slug', 'UI-UX');
    raise exception 'uppercase slug should have been rejected';
  exception when check_violation then
    null; -- Expected
  end;

  begin
    insert into public.departments (name, slug) values ('Space Slug', 'ui ux');
    raise exception 'slug with space should have been rejected';
  exception when check_violation then
    null; -- Expected
  end;

  begin
    insert into public.departments (name, slug) values ('Underscore Slug', 'ui_ux');
    raise exception 'slug with underscore should have been rejected';
  exception when check_violation then
    null; -- Expected
  end;

  begin
    insert into public.departments (name, slug) values ('Multi Hyphen Slug', 'ui--ux');
    raise exception 'slug with consecutive hyphens should have been rejected';
  exception when check_violation then
    null; -- Expected
  end;

  begin
    insert into public.departments (name, slug) values ('Leading Hyphen Slug', '-ui-ux');
    raise exception 'slug with leading hyphen should have been rejected';
  exception when check_violation then
    null; -- Expected
  end;

  begin
    insert into public.departments (name, slug) values ('Trailing Hyphen Slug', 'ui-ux-');
    raise exception 'slug with trailing hyphen should have been rejected';
  exception when check_violation then
    null; -- Expected
  end;

  -- ==============================================================
  -- TEST F: Position level check constraint (D29)
  -- ==============================================================
  insert into public.positions (name, level) values
    ('Pos Advisor', 'ADVISOR'),
    ('Pos Core', 'CORE'),
    ('Pos Steering Helper', 'STEERING_HELPER'),
    ('Pos Coordinator', 'COORDINATOR'),
    ('Pos PIC', 'PIC'),
    ('Pos Member', 'MEMBER');

  declare
    bad_level text;
  begin
    foreach bad_level in array array['Executive', 'Management', 'Staff', 'core', 'CORE ', 'VICE_PRESIDENT', '', 'UNKNOWN'] loop
      begin
        insert into public.positions (name, level) values ('Bad Pos', bad_level);
        raise exception 'invalid position level "%" should have been rejected', bad_level;
      exception when check_violation then
        null; -- Expected (23514)
      end;
    end loop;

    begin
      update public.positions set level = 'Staff' where id = p;
      raise exception 'updating position to non-canonical level should have been rejected';
    exception when check_violation then
      null; -- Expected (23514)
    end;
  end;
end$$;

-- ==============================================================
-- TEST G: Grant EXECUTE per role untuk semua RPC organisasi (#75)
-- ==============================================================
do $$
declare
  fn text;
begin
  foreach fn in array array[
    'public.admin_create_organization_period(jsonb)',
    'public.admin_update_organization_period(uuid, jsonb)',
    'public.admin_activate_organization_period(uuid)',
    'public.admin_end_organization_period(uuid)',
    'public.admin_delete_organization_period(uuid)',
    'public.admin_create_department(jsonb)',
    'public.admin_update_department(uuid, jsonb)',
    'public.admin_delete_department(uuid)',
    'public.admin_create_position(jsonb)',
    'public.admin_update_position(uuid, jsonb)',
    'public.admin_delete_position(uuid)',
    'public.admin_assign_membership_history(jsonb)',
    'public.admin_end_membership_history(uuid, date, text)'
  ] loop
    if has_function_privilege('public', fn, 'execute') then
      raise exception 'public must not execute %', fn;
    end if;
    if has_function_privilege('anon', fn, 'execute') then
      raise exception 'anon must not execute %', fn;
    end if;
    if has_function_privilege('service_role', fn, 'execute') then
      raise exception 'service_role must not execute %', fn;
    end if;
    if not has_function_privilege('authenticated', fn, 'execute') then
      raise exception 'authenticated must execute %', fn;
    end if;
  end loop;

  foreach fn in array array[
    'private.require_json_object(jsonb)',
    'private.parse_json_text(jsonb, text, boolean, integer)',
    'private.parse_json_int(jsonb, text, boolean, integer)',
    'private.parse_json_bool(jsonb, text, boolean, boolean)',
    'private.parse_json_date(jsonb, text, boolean)',
    'private.parse_json_uuid(jsonb, text, boolean)'
  ] loop
    if has_function_privilege('public', fn, 'execute')
      or has_function_privilege('anon', fn, 'execute')
      or has_function_privilege('authenticated', fn, 'execute')
      or has_function_privilege('service_role', fn, 'execute') then
      raise exception 'client roles must not execute %', fn;
    end if;
  end loop;
end$$;

-- Siapkan fixture tambahan untuk pengujian skenario penuh #75
do $$
declare
  m_inactive uuid;
  m_deleted uuid;
  d_reg uuid;
  p_noop uuid;
  d_noop uuid;
  pos_noop uuid;
begin
  insert into public.members (full_name, status) values ('Inactive Member', 'INACTIVE') returning id into m_inactive;
  insert into public.members (full_name, deleted_at) values ('Deleted Member', statement_timestamp()) returning id into m_deleted;
  insert into public.departments (name, slug) values ('Dept Pendaftaran', 'dept-pendaftaran') returning id into d_reg;
  insert into public.registrations (
    full_name, nim, email, phone, faculty, study_program, batch, preferred_department_id
  ) values (
    'Applicant Dept Ref', '10502189001', 'app-dept@example.invalid', '+6281234567890', 'FIK', 'Informatika', 2026, d_reg
  );
  insert into public.organization_periods (name, start_date, end_date, status, created_at, updated_at)
    values ('2032/2033 Noop', '2032-08-01', '2033-07-31', 'UPCOMING', '2020-01-01T00:00:00Z', '2020-01-01T00:00:00Z')
    returning id into p_noop;
  insert into public.departments (name, slug, description, display_order, active, created_at, updated_at)
    values ('Dept Noop', 'dept-noop', 'Tetap', 4, true, '2020-01-01T00:00:00Z', '2020-01-01T00:00:00Z')
    returning id into d_noop;
  insert into public.positions (name, description, level, display_order, active, created_at, updated_at)
    values ('Pos Noop', 'Tetap', 'PIC', 4, true, '2020-01-01T00:00:00Z', '2020-01-01T00:00:00Z')
    returning id into pos_noop;
  perform set_config('test.member_inactive', m_inactive::text, true);
  perform set_config('test.member_deleted', m_deleted::text, true);
  perform set_config('test.dept_reg_ref', d_reg::text, true);
  perform set_config('test.period_noop', p_noop::text, true);
  perform set_config('test.dept_noop', d_noop::text, true);
  perform set_config('test.pos_noop', pos_noop::text, true);
end$$;

-- ==============================================================
-- TEST E + H + I + J + K: Active admin reads, direct DML blocked, audited RPCs (#75)
-- ==============================================================
select set_config('request.jwt.claims', jsonb_build_object('sub', '00000000-0000-4000-8000-000000000001'::uuid, 'session_id', '00000000-0000-4000-8000-000000000011'::uuid)::text, true);
set local role authenticated;
do $$
declare
  v_period_active uuid := current_setting('test.period_active')::uuid;
  v_dept_ref uuid := current_setting('test.dept_ref')::uuid;
  v_dept_reg_ref uuid := current_setting('test.dept_reg_ref')::uuid;
  v_pos_ref uuid := current_setting('test.pos_ref')::uuid;
  v_member_active uuid := current_setting('test.member_active')::uuid;
  v_member_inactive uuid := current_setting('test.member_inactive')::uuid;
  v_member_deleted uuid := current_setting('test.member_deleted')::uuid;
  v_history_ref uuid := current_setting('test.history_ref')::uuid;
  v_period_noop uuid := current_setting('test.period_noop')::uuid;
  v_dept_noop uuid := current_setting('test.dept_noop')::uuid;
  v_pos_noop uuid := current_setting('test.pos_noop')::uuid;

  res jsonb;
  p_new uuid;
  p_del uuid;
  d_new uuid;
  d_off uuid;
  pos_core uuid;
  pos_advisor uuid;
  pos_coord uuid;
  pos_off uuid;
  h_core uuid;
  h_coord uuid;
  h_clear uuid;
  audit_rec public.audit_logs;
begin
  -- 1. Active admin can read tables
  if (select count(*) from public.departments) = 0 then
    raise exception 'active admin should be able to read departments';
  end if;
  if (select count(*) from public.positions where level in ('ADVISOR', 'CORE', 'STEERING_HELPER', 'COORDINATOR', 'PIC', 'MEMBER')) < 6 then
    raise exception 'active admin should be able to read canonical positions';
  end if;
  if (select count(*) from public.organization_periods) = 0 then
    raise exception 'active admin should be able to read organization_periods';
  end if;
  if (select count(*) from public.members) = 0 then
    raise exception 'active admin should be able to read members';
  end if;
  if (select count(*) from public.membership_histories) = 0 then
    raise exception 'active admin should be able to read membership_histories';
  end if;

  -- Direct DML must remain blocked (D13)
  perform pg_temp.expect_error('insert into public.positions (name, level) values (''Direct Pos'', ''MEMBER'')', '42501', 'direct insert positions');
  perform pg_temp.expect_error('update public.positions set level = ''CORE'' where name = ''Member''', '42501', 'direct update positions');
  perform pg_temp.expect_error('delete from public.positions where name = ''Pos Member''', '42501', 'direct delete positions');
  perform pg_temp.expect_error('delete from public.membership_histories', '42501', 'direct delete membership_histories');

  -- ============================================================
  -- TEST H: Organization Period RPCs
  -- ============================================================
  -- Create selalu UPCOMING walaupun status dikirim langsung
  res := public.admin_create_organization_period(
    '{"name":" 2025/2026 ","start_date":"2025-08-01","end_date":"2026-07-31","status":"ACTIVE"}'::jsonb
  );
  p_new := (res->>'id')::uuid;
  if res->>'name' <> '2025/2026' or res->>'status' <> 'UPCOMING' then
    raise exception 'TEST H create period mismatch: %', res;
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'ORGANIZATION_PERIOD_CREATED' and entity_id = p_new;
  if audit_rec.actor_id <> '00000000-0000-4000-8000-000000000001'
    or audit_rec.session_id <> '00000000-0000-4000-8000-000000000011'
    or audit_rec.entity_type <> 'organization_period'
    or audit_rec.new_values->>'status' <> 'UPCOMING' then
    raise exception 'TEST H ORGANIZATION_PERIOD_CREATED audit mismatch';
  end if;

  -- end_date < start_date, tanggal invalid, dan whitespace-only (\t\n) ditolak (23514)
  perform pg_temp.expect_error(
    'select public.admin_create_organization_period(''{"name":"Bad","start_date":"2026-08-01","end_date":"2025-07-31"}''::jsonb)',
    '23514', 'TEST H create period end_date < start_date');
  perform pg_temp.expect_error(
    'select public.admin_create_organization_period(''{"name":"Bad","start_date":"2026-02-30","end_date":"2026-07-31"}''::jsonb)',
    '23514', 'TEST H create period invalid calendar date');
  perform pg_temp.expect_error(
    'select public.admin_create_organization_period(''{"name":"\t\n","start_date":"2026-08-01","end_date":"2027-07-31"}''::jsonb)',
    '23514', 'TEST H create period whitespace-only name');
  perform pg_temp.expect_error(
    'select public.admin_create_organization_period(''[]''::jsonb)',
    '23514', 'TEST H create period non-object');

  -- Update period + changed_fields audit + no-op sejati tidak menulis UPDATE/audit (updated_at tetap 2020-01-01Z)
  res := public.admin_update_organization_period(p_new, '{"name":"2025/2026 Revisi","end_date":"2026-08-15","status":"ACTIVE"}'::jsonb);
  if res->>'name' <> '2025/2026 Revisi' or res->>'end_date' <> '2026-08-15' or res->>'status' <> 'UPCOMING' then
    raise exception 'TEST H update period mismatch: %', res;
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'ORGANIZATION_PERIOD_UPDATED' and entity_id = p_new;
  if audit_rec.new_values->'changed_fields' <> '["end_date","name"]'::jsonb then
    raise exception 'TEST H update period changed_fields mismatch: %', audit_rec.new_values;
  end if;

  perform public.admin_update_organization_period(v_period_noop, '{"name":"2032/2033 Noop","start_date":"2032-08-01","end_date":"2033-07-31"}'::jsonb);
  if exists (select 1 from public.audit_logs where entity_id = v_period_noop)
    or (select updated_at from public.organization_periods where id = v_period_noop) is distinct from '2020-01-01T00:00:00Z'::timestamptz then
    raise exception 'TEST H no-op update period wrote row or audit';
  end if;

  -- Update period end_date < start_date -> 23514; missing ID -> P0002 (mendahului validasi patch)
  perform pg_temp.expect_error(
    format('select public.admin_update_organization_period(%L, ''{"end_date":"2025-07-01"}''::jsonb)', p_new),
    '23514', 'TEST H update period end_date < start_date');
  perform pg_temp.expect_error(
    'select public.admin_update_organization_period(gen_random_uuid(), ''null''::jsonb)',
    'P0002', 'TEST H update missing period');
  perform pg_temp.expect_error(
    'select public.admin_activate_organization_period(gen_random_uuid())',
    'P0002', 'TEST H activate missing period');
  perform pg_temp.expect_error(
    'select public.admin_end_organization_period(gen_random_uuid())',
    'P0002', 'TEST H end missing period');
  perform pg_temp.expect_error(
    'select public.admin_delete_organization_period(gen_random_uuid())',
    'P0002', 'TEST H delete missing period');

  -- Mempersempit tanggal periode aktif (start_date atau end_date) sehingga histori keluar rentang ditolak (P0001)
  perform pg_temp.expect_error(
    format('select public.admin_update_organization_period(%L, ''{"start_date":"2024-09-01"}''::jsonb)', v_period_active),
    'P0001', 'TEST H narrow period start_date excluding existing history');
  perform pg_temp.expect_error(
    format('select public.admin_update_organization_period(%L, ''{"end_date":"2024-08-10"}''::jsonb)', v_period_active),
    'P0001', 'TEST H narrow period end_date excluding existing history');

  -- Mengaktifkan periode kedua saat ada periode ACTIVE ditolak dengan CONFLICT (P0001)
  perform pg_temp.expect_error(
    format('select public.admin_activate_organization_period(%L)', p_new),
    'P0001', 'TEST H activate second active period');

  -- Mengakhiri periode UPCOMING ditolak (P0001)
  perform pg_temp.expect_error(
    format('select public.admin_end_organization_period(%L)', p_new),
    'P0001', 'TEST H end UPCOMING period');

  -- Menghapus periode ACTIVE ditolak (P0001)
  perform pg_temp.expect_error(
    format('select public.admin_delete_organization_period(%L)', v_period_active),
    'P0001', 'TEST H delete ACTIVE period');

  -- Akhiri periode aktif lama -> ENDED; histori tetap utuh; idempoten saat diakhiri ulang
  res := public.admin_end_organization_period(v_period_active);
  if res->>'status' <> 'ENDED' then
    raise exception 'TEST H end active period failed: %', res;
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'ORGANIZATION_PERIOD_ENDED' and entity_id = v_period_active;
  if audit_rec.old_values <> '{"status":"ACTIVE"}'::jsonb or audit_rec.new_values <> '{"status":"ENDED"}'::jsonb then
    raise exception 'TEST H ORGANIZATION_PERIOD_ENDED audit mismatch';
  end if;
  perform public.admin_end_organization_period(v_period_active); -- idempoten
  if (select count(*) from public.audit_logs where action = 'ORGANIZATION_PERIOD_ENDED' and entity_id = v_period_active) <> 1 then
    raise exception 'TEST H idempotent end period wrote duplicate audit';
  end if;
  if not exists (select 1 from public.membership_histories where id = v_history_ref) then
    raise exception 'TEST H ending period must preserve membership histories';
  end if;

  -- Mengaktifkan kembali periode ENDED ditolak (P0001)
  perform pg_temp.expect_error(
    format('select public.admin_activate_organization_period(%L)', v_period_active),
    'P0001', 'TEST H reactivate ENDED period');

  -- Delete guard: periode ENDED yang direferensikan histori tidak bisa dihapus (P0001)
  perform pg_temp.expect_error(
    format('select public.admin_delete_organization_period(%L)', v_period_active),
    'P0001', 'TEST H delete referenced period');

  -- Sekarang periode baru bisa diaktifkan -> ACTIVE (idempoten bila diaktifkan lagi)
  res := public.admin_activate_organization_period(p_new);
  if res->>'status' <> 'ACTIVE' then
    raise exception 'TEST H activate new period failed: %', res;
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'ORGANIZATION_PERIOD_ACTIVATED' and entity_id = p_new;
  if audit_rec.old_values <> '{"status":"UPCOMING"}'::jsonb or audit_rec.new_values <> '{"status":"ACTIVE"}'::jsonb then
    raise exception 'TEST H ORGANIZATION_PERIOD_ACTIVATED audit mismatch';
  end if;
  perform public.admin_activate_organization_period(p_new);
  if (select count(*) from public.audit_logs where action = 'ORGANIZATION_PERIOD_ACTIVATED' and entity_id = p_new) <> 1 then
    raise exception 'TEST H idempotent activate period wrote duplicate audit';
  end if;

  -- Periode UPCOMING tanpa histori boleh dihapus + diaudit
  p_del := (public.admin_create_organization_period('{"name":"Temp Period","start_date":"2028-08-01","end_date":"2029-07-31"}'::jsonb)->>'id')::uuid;
  res := public.admin_delete_organization_period(p_del);
  if res->>'deleted' <> 'true' or exists (select 1 from public.organization_periods where id = p_del) then
    raise exception 'TEST H delete unreferenced period failed';
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'ORGANIZATION_PERIOD_DELETED' and entity_id = p_del;

  -- ============================================================
  -- TEST I: Department RPCs (create, update, active/inactive, display_order, delete guard)
  -- ============================================================
  res := public.admin_create_department(
    '{"name":"Web Development","slug":"web-development","description":"Deskripsi rahasia internal","display_order":3,"active":true}'::jsonb
  );
  d_new := (res->>'id')::uuid;
  if res->>'slug' <> 'web-development' or (res->>'display_order')::int <> 3 or (res->>'active')::boolean <> true then
    raise exception 'TEST I create department mismatch: %', res;
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'DEPARTMENT_CREATED' and entity_id = d_new;
  if audit_rec.new_values::text like '%Deskripsi rahasia%' then
    raise exception 'TEST I DEPARTMENT_CREATED leaked description into audit';
  end if;

  -- Duplicate slug -> 23505; invalid types / whitespace-only / int32 overflow -> 23514
  perform pg_temp.expect_error(
    'select public.admin_create_department(''{"name":"Dup","slug":"web-development"}''::jsonb)',
    '23505', 'TEST I duplicate department slug');
  perform pg_temp.expect_error(
    'select public.admin_create_department(''{"name":"\t\n","slug":"ws-dept"}''::jsonb)',
    '23514', 'TEST I whitespace-only department name');
  perform pg_temp.expect_error(
    'select public.admin_create_department(''{"name":"Bad","slug":"bad","display_order":1.5}''::jsonb)',
    '23514', 'TEST I fractional display_order');
  perform pg_temp.expect_error(
    'select public.admin_create_department(''{"name":"Bad","slug":"bad","display_order":2147483648}''::jsonb)',
    '23514', 'TEST I int32 overflow display_order');
  perform pg_temp.expect_error(
    'select public.admin_create_department(''{"name":"Bad","slug":"bad","active":"true"}''::jsonb)',
    '23514', 'TEST I non-boolean active');

  -- Update department (display_order, description, active) + no-op sejati + missing ID
  res := public.admin_update_department(d_new, '{"display_order":7,"description":"Deskripsi baru rahasia","active":false}'::jsonb);
  if (res->>'display_order')::int <> 7 or (res->>'active')::boolean <> false then
    raise exception 'TEST I update department mismatch: %', res;
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'DEPARTMENT_UPDATED' and entity_id = d_new;
  if audit_rec.new_values->'changed_fields' <> '["active","description","display_order"]'::jsonb
    or audit_rec.new_values::text like '%Deskripsi baru%' then
    raise exception 'TEST I DEPARTMENT_UPDATED audit mismatch: %', audit_rec.new_values;
  end if;

  perform public.admin_update_department(v_dept_noop, '{"name":"Dept Noop","slug":"dept-noop","description":"Tetap","display_order":4,"active":true}'::jsonb);
  if exists (select 1 from public.audit_logs where entity_id = v_dept_noop)
    or (select updated_at from public.departments where id = v_dept_noop) is distinct from '2020-01-01T00:00:00Z'::timestamptz then
    raise exception 'TEST I no-op update department wrote row or audit';
  end if;

  perform pg_temp.expect_error(
    'select public.admin_update_department(gen_random_uuid(), ''null''::jsonb)',
    'P0002', 'TEST I update missing department');
  perform pg_temp.expect_error(
    'select public.admin_delete_department(gen_random_uuid())',
    'P0002', 'TEST I delete missing department');
  -- Aktifkan kembali untuk penempatan nanti
  perform public.admin_update_department(d_new, '{"active":true}'::jsonb);

  -- Delete guard: departemen direferensikan histori & registrasi ditolak (P0001), tapi bisa dinonaktifkan
  perform pg_temp.expect_error(
    format('select public.admin_delete_department(%L)', v_dept_ref),
    'P0001', 'TEST I delete department referenced by history');
  perform pg_temp.expect_error(
    format('select public.admin_delete_department(%L)', v_dept_reg_ref),
    'P0001', 'TEST I delete department referenced by registration');
  res := public.admin_update_department(v_dept_ref, '{"active":false}'::jsonb);
  if (res->>'active')::boolean <> false then
    raise exception 'TEST I deactivate referenced department failed';
  end if;

  -- Departemen tanpa referensi boleh dihapus + diaudit
  d_off := (public.admin_create_department('{"name":"Temp Dept","slug":"temp-dept","active":false}'::jsonb)->>'id')::uuid;
  res := public.admin_delete_department(d_off);
  if res->>'deleted' <> 'true' or exists (select 1 from public.departments where id = d_off) then
    raise exception 'TEST I delete unreferenced department failed';
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'DEPARTMENT_DELETED' and entity_id = d_off;

  -- ============================================================
  -- TEST J: Position RPCs (create, update, active/inactive, display_order, D29, D24 guard, delete guard)
  -- ============================================================
  pos_core := (public.admin_create_position('{"name":"Ketua Umum","level":"CORE","description":"Rahasia posisi","display_order":2,"active":true}'::jsonb)->>'id')::uuid;
  pos_advisor := (public.admin_create_position('{"name":"Pembina","level":"ADVISOR","display_order":1}'::jsonb)->>'id')::uuid;
  pos_coord := (public.admin_create_position('{"name":"Koordinator Divisi","level":"COORDINATOR","display_order":6}'::jsonb)->>'id')::uuid;
  pos_off := (public.admin_create_position('{"name":"Posisi Nonaktif","level":"MEMBER","display_order":9,"active":false}'::jsonb)->>'id')::uuid;

  select * into strict audit_rec from public.audit_logs where action = 'POSITION_CREATED' and entity_id = pos_core;
  if audit_rec.new_values->>'level' <> 'CORE' or audit_rec.new_values::text like '%Rahasia posisi%' then
    raise exception 'TEST J POSITION_CREATED audit mismatch: %', audit_rec.new_values;
  end if;

  -- Level non-kanonis dan whitespace-only name ditolak (23514)
  perform pg_temp.expect_error(
    'select public.admin_create_position(''{"name":"Bad","level":"Executive"}''::jsonb)',
    '23514', 'TEST J create position invalid level');
  perform pg_temp.expect_error(
    'select public.admin_create_position(''{"name":"\r\n","level":"CORE"}''::jsonb)',
    '23514', 'TEST J create position whitespace-only name');

  -- Update position (display_order, description, active) + no-op sejati + missing ID
  res := public.admin_update_position(pos_coord, '{"display_order":5,"description":"Ubah deskripsi rahasia","active":true}'::jsonb);
  if (res->>'display_order')::int <> 5 then
    raise exception 'TEST J update position mismatch: %', res;
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'POSITION_UPDATED' and entity_id = pos_coord;
  if audit_rec.new_values->'changed_fields' <> '["description","display_order"]'::jsonb
    or audit_rec.new_values::text like '%Ubah deskripsi%' then
    raise exception 'TEST J POSITION_UPDATED audit mismatch: %', audit_rec.new_values;
  end if;

  perform public.admin_update_position(v_pos_noop, '{"name":"Pos Noop","description":"Tetap","level":"PIC","display_order":4,"active":true}'::jsonb);
  if exists (select 1 from public.audit_logs where entity_id = v_pos_noop)
    or (select updated_at from public.positions where id = v_pos_noop) is distinct from '2020-01-01T00:00:00Z'::timestamptz then
    raise exception 'TEST J no-op update position wrote row or audit';
  end if;

  perform pg_temp.expect_error(
    'select public.admin_update_position(gen_random_uuid(), ''null''::jsonb)',
    'P0002', 'TEST J update missing position');
  perform pg_temp.expect_error(
    'select public.admin_delete_position(gen_random_uuid())',
    'P0002', 'TEST J delete missing position');

  -- Delete guard posisi yang direferensikan histori ditolak (P0001), tapi bisa dinonaktifkan
  perform pg_temp.expect_error(
    format('select public.admin_delete_position(%L)', v_pos_ref),
    'P0001', 'TEST J delete referenced position');
  res := public.admin_update_position(v_pos_ref, '{"active":false}'::jsonb);
  if (res->>'active')::boolean <> false then
    raise exception 'TEST J deactivate referenced position failed';
  end if;

  -- ============================================================
  -- TEST K: Membership History RPCs (assign, D24, end placement)
  -- ============================================================
  -- Posisi CORE & ADVISOR boleh tanpa departemen (D24)
  res := public.admin_assign_membership_history(jsonb_build_object(
    'member_id', v_member_active,
    'organization_period_id', p_new,
    'department_id', null,
    'position_id', pos_core,
    'start_date', '2025-08-15',
    'notes', 'Catatan privat penempatan'
  ));
  h_core := (res->>'id')::uuid;
  if res->>'department_id' is not null or res->>'start_date' <> '2025-08-15' then
    raise exception 'TEST K assign CORE placement mismatch: %', res;
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'MEMBERSHIP_HISTORY_CREATED' and entity_id = h_core;
  if audit_rec.new_values::text like '%Catatan privat%' then
    raise exception 'TEST K MEMBERSHIP_HISTORY_CREATED leaked notes';
  end if;

  perform public.admin_assign_membership_history(jsonb_build_object(
    'member_id', v_member_active,
    'organization_period_id', p_new,
    'position_id', pos_advisor,
    'start_date', '2025-08-15'
  ));

  -- D29 mendahului D24: level non-kanonis pada pos_core wajib 23514, bukan P0001
  perform pg_temp.expect_error(
    format('select public.admin_update_position(%L, ''{"level":"INVALID"}''::jsonb)', pos_core),
    '23514', 'TEST K invalid level on CORE position with department-less history');

  -- D24 invariant guard: ubah pos_core menjadi MEMBER saat dipakai histori tanpa departemen ditolak (P0001)
  perform pg_temp.expect_error(
    format('select public.admin_update_position(%L, ''{"level":"MEMBER"}''::jsonb)', pos_core),
    'P0001', 'TEST K demote CORE position with department-less history');

  -- D24: posisi non-inti tanpa departemen ditolak (23514)
  perform pg_temp.expect_error(
    format('select public.admin_assign_membership_history(%L::jsonb)', jsonb_build_object(
      'member_id', v_member_active,
      'organization_period_id', p_new,
      'department_id', null,
      'position_id', pos_coord,
      'start_date', '2025-08-15'
    )),
    '23514', 'TEST K assign non-core without department');

  -- end_date < start_date ditolak (23514)
  perform pg_temp.expect_error(
    format('select public.admin_assign_membership_history(%L::jsonb)', jsonb_build_object(
      'member_id', v_member_active,
      'organization_period_id', p_new,
      'department_id', d_new,
      'position_id', pos_coord,
      'start_date', '2025-09-10',
      'end_date', '2025-09-01'
    )),
    '23514', 'TEST K assign end_date < start_date');

  -- Validasi bisnis lain: periode ENDED, tanggal di luar periode, dept/pos nonaktif, member inactive/deleted
  perform pg_temp.expect_error(
    format('select public.admin_assign_membership_history(%L::jsonb)', jsonb_build_object(
      'member_id', v_member_active,
      'organization_period_id', v_period_active,
      'department_id', d_new,
      'position_id', pos_coord,
      'start_date', '2024-09-01'
    )),
    'P0001', 'TEST K assign in ENDED period');
  perform pg_temp.expect_error(
    format('select public.admin_assign_membership_history(%L::jsonb)', jsonb_build_object(
      'member_id', v_member_active,
      'organization_period_id', p_new,
      'department_id', d_new,
      'position_id', pos_coord,
      'start_date', '2025-07-01'
    )),
    'P0001', 'TEST K assign start_date outside period');
  perform pg_temp.expect_error(
    format('select public.admin_assign_membership_history(%L::jsonb)', jsonb_build_object(
      'member_id', v_member_active,
      'organization_period_id', p_new,
      'department_id', d_new,
      'position_id', pos_coord,
      'start_date', '2025-09-01',
      'end_date', '2026-09-01'
    )),
    'P0001', 'TEST K assign end_date outside period');
  perform pg_temp.expect_error(
    format('select public.admin_assign_membership_history(%L::jsonb)', jsonb_build_object(
      'member_id', v_member_active,
      'organization_period_id', gen_random_uuid(),
      'department_id', d_new,
      'position_id', pos_coord,
      'start_date', '2025-09-01'
    )),
    'P0002', 'TEST K assign missing period');
  perform pg_temp.expect_error(
    format('select public.admin_assign_membership_history(%L::jsonb)', jsonb_build_object(
      'member_id', v_member_active,
      'organization_period_id', p_new,
      'department_id', d_new,
      'position_id', gen_random_uuid(),
      'start_date', '2025-09-01'
    )),
    'P0002', 'TEST K assign missing position');
  perform pg_temp.expect_error(
    format('select public.admin_assign_membership_history(%L::jsonb)', jsonb_build_object(
      'member_id', v_member_active,
      'organization_period_id', p_new,
      'department_id', gen_random_uuid(),
      'position_id', pos_coord,
      'start_date', '2025-09-01'
    )),
    'P0002', 'TEST K assign missing department');
  perform pg_temp.expect_error(
    format('select public.admin_assign_membership_history(%L::jsonb)', jsonb_build_object(
      'member_id', v_member_active,
      'organization_period_id', p_new,
      'department_id', v_dept_ref,
      'position_id', pos_coord,
      'start_date', '2025-09-01'
    )),
    'P0001', 'TEST K assign inactive department');
  perform pg_temp.expect_error(
    format('select public.admin_assign_membership_history(%L::jsonb)', jsonb_build_object(
      'member_id', v_member_active,
      'organization_period_id', p_new,
      'department_id', d_new,
      'position_id', pos_off,
      'start_date', '2025-09-01'
    )),
    'P0001', 'TEST K assign inactive position');
  perform pg_temp.expect_error(
    format('select public.admin_assign_membership_history(%L::jsonb)', jsonb_build_object(
      'member_id', v_member_inactive,
      'organization_period_id', p_new,
      'department_id', d_new,
      'position_id', pos_coord,
      'start_date', '2025-09-01'
    )),
    'P0001', 'TEST K assign inactive member');
  perform pg_temp.expect_error(
    format('select public.admin_assign_membership_history(%L::jsonb)', jsonb_build_object(
      'member_id', v_member_deleted,
      'organization_period_id', p_new,
      'department_id', d_new,
      'position_id', pos_coord,
      'start_date', '2025-09-01'
    )),
    'P0002', 'TEST K assign soft-deleted member');

  -- Penempatan non-inti dengan departemen aktif berhasil
  h_coord := (public.admin_assign_membership_history(jsonb_build_object(
    'member_id', v_member_active,
    'organization_period_id', p_new,
    'department_id', d_new,
    'position_id', pos_coord,
    'start_date', '2025-09-01'
  ))->>'id')::uuid;

  -- Akhiri penempatan: end_date null / notes >2000 / end_date < start_date -> 23514; di luar periode -> P0001; missing ID -> P0002
  perform pg_temp.expect_error(
    format('select public.admin_end_membership_history(%L, null)', h_coord),
    '23514', 'TEST K end placement null end_date');
  perform pg_temp.expect_error(
    format('select public.admin_end_membership_history(%L, ''2025-12-31''::date, repeat(''x'', 2001))', h_coord),
    '23514', 'TEST K end placement notes >2000');
  perform pg_temp.expect_error(
    format('select public.admin_end_membership_history(%L, ''2025-08-31''::date)', h_coord),
    '23514', 'TEST K end placement before start_date');
  perform pg_temp.expect_error(
    format('select public.admin_end_membership_history(%L, ''2027-01-01''::date)', h_coord),
    'P0001', 'TEST K end placement after period end_date');
  perform pg_temp.expect_error(
    'select public.admin_end_membership_history(gen_random_uuid(), null)',
    'P0002', 'TEST K end missing placement precedes payload validation');

  -- Akhiri penempatan valid + catatan (isi catatan tidak bocor ke audit)
  res := public.admin_end_membership_history(h_coord, '2025-12-31'::date, 'Selesai tugas rahasia');
  if res->>'end_date' <> '2025-12-31' or res->>'notes' <> 'Selesai tugas rahasia' then
    raise exception 'TEST K end placement mismatch: %', res;
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'MEMBERSHIP_HISTORY_ENDED' and entity_id = h_coord;
  if audit_rec.old_values <> '{"end_date":null}'::jsonb
    or audit_rec.new_values <> '{"end_date":"2025-12-31","notes_changed":true}'::jsonb
    or audit_rec.new_values::text like '%Selesai tugas%' then
    raise exception 'TEST K MEMBERSHIP_HISTORY_ENDED audit mismatch: %', audit_rec.new_values;
  end if;

  -- Idempoten bila dipanggil ulang dengan tanggal sama & p_notes null atau sama; konflik bila tanggal/catatan beda
  perform public.admin_end_membership_history(h_coord, '2025-12-31'::date, null);
  perform public.admin_end_membership_history(h_coord, '2025-12-31'::date, 'Selesai tugas rahasia');
  if (select count(*) from public.audit_logs where action = 'MEMBERSHIP_HISTORY_ENDED' and entity_id = h_coord) <> 1 then
    raise exception 'TEST K idempotent end placement wrote duplicate audit';
  end if;
  perform pg_temp.expect_error(
    format('select public.admin_end_membership_history(%L, ''2026-01-15''::date)', h_coord),
    'P0001', 'TEST K overwrite already ended placement date');
  perform pg_temp.expect_error(
    format('select public.admin_end_membership_history(%L, ''2025-12-31''::date, '''')', h_coord),
    'P0001', 'TEST K overwrite already ended placement notes');

  -- Menghapus catatan lama lewat whitespace (\t\n) saat mengakhiri penempatan
  h_clear := (public.admin_assign_membership_history(jsonb_build_object(
    'member_id', v_member_active,
    'organization_period_id', p_new,
    'department_id', d_new,
    'position_id', pos_coord,
    'start_date', '2025-09-15',
    'notes', 'Catatan sementara'
  ))->>'id')::uuid;
  res := public.admin_end_membership_history(h_clear, '2025-12-31'::date, E'\t\n ');
  if res->>'notes' is not null then
    raise exception 'TEST K whitespace notes should clear to null: %', res;
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'MEMBERSHIP_HISTORY_ENDED' and entity_id = h_clear;
  if audit_rec.new_values <> '{"end_date":"2025-12-31","notes_changed":true}'::jsonb then
    raise exception 'TEST K clear notes audit mismatch: %', audit_rec.new_values;
  end if;

  -- Hapus posisi tanpa histori (pos_off) berhasil + audit
  res := public.admin_delete_position(pos_off);
  if res->>'deleted' <> 'true' or exists (select 1 from public.positions where id = pos_off) then
    raise exception 'TEST J delete unreferenced position failed';
  end if;
  select * into strict audit_rec from public.audit_logs where action = 'POSITION_DELETED' and entity_id = pos_off;

  -- Simpan ID untuk tes rollback audit di bawah
  perform set_config('test.period_new', p_new::text, true);
  perform set_config('test.dept_new', d_new::text, true);
  perform set_config('test.pos_coord', pos_coord::text, true);
  perform set_config('test.history_core', h_core::text, true);
end$$;
reset role;

-- ==============================================================
-- TEST L: Audit failure rolls back EVERY organization mutation atomically (all 13 RPCs)
-- ==============================================================
do $$
declare
  rb_period uuid;
  rb_dept uuid;
  rb_pos uuid;
begin
  insert into public.organization_periods (name, start_date, end_date, status)
    values ('2031/2032 Rollback Target', '2031-08-01', '2032-07-31', 'UPCOMING')
    returning id into rb_period;
  insert into public.departments (name, slug)
    values ('Dept Delete Rollback', 'dept-delete-rollback')
    returning id into rb_dept;
  insert into public.positions (name, level)
    values ('Pos Delete Rollback', 'MEMBER')
    returning id into rb_pos;
  perform set_config('test.rb_period', rb_period::text, true);
  perform set_config('test.rb_dept', rb_dept::text, true);
  perform set_config('test.rb_pos', rb_pos::text, true);
end$$;

create function pg_temp.fail_audit_org() returns trigger language plpgsql as $$
begin
  raise exception 'simulated org audit failure';
end$$;
create trigger trg_fail_audit_org before insert on public.audit_logs
  for each row execute function pg_temp.fail_audit_org();

select set_config('request.jwt.claims', jsonb_build_object('sub', '00000000-0000-4000-8000-000000000001'::uuid, 'session_id', '00000000-0000-4000-8000-000000000011'::uuid)::text, true);
set local role authenticated;
do $$
declare
  v_period_new uuid := current_setting('test.period_new')::uuid;
  v_dept_new uuid := current_setting('test.dept_new')::uuid;
  v_pos_coord uuid := current_setting('test.pos_coord')::uuid;
  v_member_active uuid := current_setting('test.member_active')::uuid;
  v_history_core uuid := current_setting('test.history_core')::uuid;
  v_rb_period uuid := current_setting('test.rb_period')::uuid;
  v_rb_dept uuid := current_setting('test.rb_dept')::uuid;
  v_rb_pos uuid := current_setting('test.rb_pos')::uuid;
  v_stmt text;
begin
  foreach v_stmt in array array[
    'select public.admin_create_organization_period(''{"name":"Rollback Period","start_date":"2030-01-01","end_date":"2030-12-31"}''::jsonb)',
    format('select public.admin_update_organization_period(%L, ''{"name":"Rollback Period Rename"}''::jsonb)', v_rb_period),
    format('select public.admin_end_organization_period(%L)', v_period_new),
    format('select public.admin_delete_organization_period(%L)', v_rb_period),
    'select public.admin_create_department(''{"name":"Rollback Dept","slug":"rollback-dept"}''::jsonb)',
    format('select public.admin_update_department(%L, ''{"name":"Rollback Rename"}''::jsonb)', v_dept_new),
    format('select public.admin_delete_department(%L)', v_rb_dept),
    'select public.admin_create_position(''{"name":"Rollback Pos","level":"MEMBER"}''::jsonb)',
    format('select public.admin_update_position(%L, ''{"name":"Rollback Pos Rename"}''::jsonb)', v_pos_coord),
    format('select public.admin_delete_position(%L)', v_rb_pos),
    format('select public.admin_assign_membership_history(%L::jsonb)', jsonb_build_object(
      'member_id', v_member_active,
      'organization_period_id', v_period_new,
      'department_id', v_dept_new,
      'position_id', v_pos_coord,
      'start_date', '2025-10-01',
      'notes', 'rollback-note'
    )),
    format('select public.admin_end_membership_history(%L, ''2025-11-30''::date)', v_history_core)
  ] loop
    begin
      execute v_stmt;
      raise exception 'TEST L GAGAL: mutasi berhasil meski audit gagal: %', v_stmt;
    exception when raise_exception then
      if sqlerrm <> 'simulated org audit failure' then
        raise;
      end if;
    end;
  end loop;
end$$;
reset role;

-- Pastikan admin_end_organization_period benar-benar rollback sebelum menguji rollback activate
do $$
begin
  if (select status from public.organization_periods where id = current_setting('test.period_new')::uuid) is distinct from 'ACTIVE' then
    raise exception 'TEST L GAGAL: admin_end_organization_period tidak rollback saat audit gagal';
  end if;
end$$;

-- Uji rollback admin_activate_organization_period saat tidak ada periode ACTIVE
update public.organization_periods set status = 'ENDED' where id = current_setting('test.period_new')::uuid;
set local role authenticated;
do $$
begin
  begin
    perform public.admin_activate_organization_period(current_setting('test.rb_period')::uuid);
    raise exception 'TEST L GAGAL: activate berhasil meski audit gagal';
  exception when raise_exception then
    if sqlerrm <> 'simulated org audit failure' then
      raise;
    end if;
  end;
end$$;
reset role;

drop trigger trg_fail_audit_org on public.audit_logs;
drop function pg_temp.fail_audit_org();

do $$
begin
  if exists (select 1 from public.organization_periods where name = 'Rollback Period')
    or (select name from public.organization_periods where id = current_setting('test.rb_period')::uuid) is distinct from '2031/2032 Rollback Target'
    or (select status from public.organization_periods where id = current_setting('test.rb_period')::uuid) is distinct from 'UPCOMING'
    or exists (select 1 from public.departments where slug = 'rollback-dept')
    or (select name from public.departments where id = current_setting('test.dept_new')::uuid) = 'Rollback Rename'
    or not exists (select 1 from public.departments where id = current_setting('test.rb_dept')::uuid)
    or exists (select 1 from public.positions where name = 'Rollback Pos')
    or (select name from public.positions where id = current_setting('test.pos_coord')::uuid) = 'Rollback Pos Rename'
    or not exists (select 1 from public.positions where id = current_setting('test.rb_pos')::uuid)
    or exists (select 1 from public.membership_histories where notes = 'rollback-note')
    or (select end_date from public.membership_histories where id = current_setting('test.history_core')::uuid) is not null then
    raise exception 'TEST L GAGAL: mutasi tidak rollback atomik saat audit gagal';
  end if;
end$$;

-- ==============================================================
-- TEST M: Access Control — Inactive admin, expired session, non-admin, anon, service_role
-- ==============================================================
-- 1. Inactive admin & expired session rejected on all 13 RPCs
do $$
declare
  v_call text;
  v_calls text[] := array[
    'select public.admin_create_organization_period(''{"name":"X","start_date":"2029-01-01","end_date":"2029-12-31"}''::jsonb)',
    'select public.admin_update_organization_period(gen_random_uuid(), ''{"name":"X"}''::jsonb)',
    'select public.admin_activate_organization_period(gen_random_uuid())',
    'select public.admin_end_organization_period(gen_random_uuid())',
    'select public.admin_delete_organization_period(gen_random_uuid())',
    'select public.admin_create_department(''{"name":"X","slug":"x-dept"}''::jsonb)',
    'select public.admin_update_department(gen_random_uuid(), ''{"name":"X"}''::jsonb)',
    'select public.admin_delete_department(gen_random_uuid())',
    'select public.admin_create_position(''{"name":"X","level":"MEMBER"}''::jsonb)',
    'select public.admin_update_position(gen_random_uuid(), ''{"name":"X"}''::jsonb)',
    'select public.admin_delete_position(gen_random_uuid())',
    'select public.admin_assign_membership_history(''{}''::jsonb)',
    'select public.admin_end_membership_history(gen_random_uuid(), ''2025-12-01''::date)'
  ];
begin
  -- Expired admin session
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000001","session_id":"00000000-0000-4000-8000-000000000012"}', true);
  set local role authenticated;
  foreach v_call in array v_calls loop
    perform pg_temp.expect_error(v_call, '42501', 'expired session: ' || v_call);
  end loop;
  reset role;

  -- Inactive admin
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000001","session_id":"00000000-0000-4000-8000-000000000011"}', true);
  update public.admins set is_active = false where id = '00000000-0000-4000-8000-000000000001';
  set local role authenticated;
  foreach v_call in array v_calls loop
    perform pg_temp.expect_error(v_call, '42501', 'inactive admin: ' || v_call);
  end loop;
  reset role;
  update public.admins set is_active = true where id = '00000000-0000-4000-8000-000000000001';
end$$;

-- 2. Authenticated non-admin: 0 rows on reads, direct DML blocked, all 13 RPCs rejected (42501)
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002"}', true);
set local role authenticated;
do $$
declare
  v_call text;
begin
  if exists(select from public.departments) then
    raise exception 'non-admin should not be able to read departments';
  end if;
  if exists(select from public.positions) then
    raise exception 'non-admin should not be able to read positions';
  end if;
  if exists(select from public.organization_periods) then
    raise exception 'non-admin should not be able to read organization_periods';
  end if;
  if exists(select from public.members) then
    raise exception 'non-admin should not be able to read members';
  end if;
  if exists(select from public.membership_histories) then
    raise exception 'non-admin should not be able to read membership_histories';
  end if;

  perform pg_temp.expect_error('insert into public.positions (name, level) values (''NonAdmin Pos'', ''MEMBER'')', '42501', 'non-admin direct insert');
  perform pg_temp.expect_error('update public.positions set level = ''CORE''', '42501', 'non-admin direct update');
  perform pg_temp.expect_error('delete from public.positions', '42501', 'non-admin direct delete');

  foreach v_call in array array[
    'select public.admin_create_organization_period(''{"name":"X","start_date":"2029-01-01","end_date":"2029-12-31"}''::jsonb)',
    'select public.admin_update_organization_period(gen_random_uuid(), ''{"name":"X"}''::jsonb)',
    'select public.admin_activate_organization_period(gen_random_uuid())',
    'select public.admin_end_organization_period(gen_random_uuid())',
    'select public.admin_delete_organization_period(gen_random_uuid())',
    'select public.admin_create_department(''{"name":"X","slug":"x-dept"}''::jsonb)',
    'select public.admin_update_department(gen_random_uuid(), ''{"name":"X"}''::jsonb)',
    'select public.admin_delete_department(gen_random_uuid())',
    'select public.admin_create_position(''{"name":"X","level":"MEMBER"}''::jsonb)',
    'select public.admin_update_position(gen_random_uuid(), ''{"name":"X"}''::jsonb)',
    'select public.admin_delete_position(gen_random_uuid())',
    'select public.admin_assign_membership_history(''{}''::jsonb)',
    'select public.admin_end_membership_history(gen_random_uuid(), ''2025-12-01''::date)'
  ] loop
    perform pg_temp.expect_error(v_call, '42501', 'non-admin rpc: ' || v_call);
  end loop;
end$$;
reset role;

-- 3. Anon: denied on private tables and all 13 RPCs (42501)
set local role anon;
do $$
declare
  v_call text;
begin
  perform pg_temp.expect_error('select id from public.departments', '42501', 'anon read departments');
  perform pg_temp.expect_error('select id from public.positions', '42501', 'anon read positions');
  perform pg_temp.expect_error('insert into public.positions (name, level) values (''Anon Pos'', ''MEMBER'')', '42501', 'anon insert positions');
  perform pg_temp.expect_error('update public.positions set level = ''CORE''', '42501', 'anon update positions');
  perform pg_temp.expect_error('delete from public.positions', '42501', 'anon delete positions');
  perform pg_temp.expect_error('select id from public.organization_periods', '42501', 'anon read organization_periods');
  perform pg_temp.expect_error('select id from public.members', '42501', 'anon read members');
  perform pg_temp.expect_error('select id from public.membership_histories', '42501', 'anon read membership_histories');

  foreach v_call in array array[
    'select public.admin_create_organization_period(''{"name":"X","start_date":"2029-01-01","end_date":"2029-12-31"}''::jsonb)',
    'select public.admin_update_organization_period(gen_random_uuid(), ''{"name":"X"}''::jsonb)',
    'select public.admin_activate_organization_period(gen_random_uuid())',
    'select public.admin_end_organization_period(gen_random_uuid())',
    'select public.admin_delete_organization_period(gen_random_uuid())',
    'select public.admin_create_department(''{"name":"X","slug":"x-dept"}''::jsonb)',
    'select public.admin_update_department(gen_random_uuid(), ''{"name":"X"}''::jsonb)',
    'select public.admin_delete_department(gen_random_uuid())',
    'select public.admin_create_position(''{"name":"X","level":"MEMBER"}''::jsonb)',
    'select public.admin_update_position(gen_random_uuid(), ''{"name":"X"}''::jsonb)',
    'select public.admin_delete_position(gen_random_uuid())',
    'select public.admin_assign_membership_history(''{}''::jsonb)',
    'select public.admin_end_membership_history(gen_random_uuid(), ''2025-12-01''::date)'
  ] loop
    perform pg_temp.expect_error(v_call, '42501', 'anon rpc: ' || v_call);
  end loop;
end$$;
reset role;

-- 4. service_role: denied on all 13 RPCs (42501)
set local role service_role;
do $$
declare
  v_call text;
begin
  foreach v_call in array array[
    'select public.admin_create_organization_period(''{"name":"X","start_date":"2029-01-01","end_date":"2029-12-31"}''::jsonb)',
    'select public.admin_update_organization_period(gen_random_uuid(), ''{"name":"X"}''::jsonb)',
    'select public.admin_activate_organization_period(gen_random_uuid())',
    'select public.admin_end_organization_period(gen_random_uuid())',
    'select public.admin_delete_organization_period(gen_random_uuid())',
    'select public.admin_create_department(''{"name":"X","slug":"x-dept"}''::jsonb)',
    'select public.admin_update_department(gen_random_uuid(), ''{"name":"X"}''::jsonb)',
    'select public.admin_delete_department(gen_random_uuid())',
    'select public.admin_create_position(''{"name":"X","level":"MEMBER"}''::jsonb)',
    'select public.admin_update_position(gen_random_uuid(), ''{"name":"X"}''::jsonb)',
    'select public.admin_delete_position(gen_random_uuid())',
    'select public.admin_assign_membership_history(''{}''::jsonb)',
    'select public.admin_end_membership_history(gen_random_uuid(), ''2025-12-01''::date)'
  ] loop
    perform pg_temp.expect_error(v_call, '42501', 'service_role rpc: ' || v_call);
  end loop;
end$$;
reset role;

rollback;
