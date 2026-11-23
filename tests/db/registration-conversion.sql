-- Tes: Registration review & member conversion (Issue #29)
-- Acceptance criteria yang diuji:
--   ✓ Status transition tervalidasi (SUBMITTED → UNDER_REVIEW → ACCEPTED | REJECTED)
--   ✓ Admin notes tersedia, bisa dikosongkan, no-op tidak diaudit
--   ✓ Hanya ACCEPTED yang dapat dikonversi (D12)
--   ✓ Double conversion tidak mungkin terjadi (D12, scope 6)
--   ✓ Conversion membuat member ACTIVE + membership history
--   ✓ Periode, posisi, departemen, start date, dan identitas tervalidasi
--   ✓ Conversion + audit atomic (D13)
--   ✓ U01: department_id nullable (pengurus inti)
--   ✓ Grant/RLS per role: admin authenticated, non-admin, anon, service_role

begin;

-- Seed auth fixture (pola dari tests/db/organization.sql)
insert into auth.users (id) values
  ('00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000002');
insert into public.admins (id, name, is_active) values
  ('00000000-0000-4000-8000-000000000001', 'Synthetic Admin', true);
insert into auth.sessions (id, user_id, created_at) values
  ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', statement_timestamp());

-- Aktifkan JWT admin untuk memanggil RPC
select set_config('request.jwt.claims',
  jsonb_build_object(
    'sub', '00000000-0000-4000-8000-000000000001'::uuid,
    'session_id', '00000000-0000-4000-8000-000000000011'::uuid
  )::text, true);

-- Menjalankan sql dan mewajibkan error dengan sqlstate tertentu. Exception sendiri berada di
-- luar handler sehingga kegagalan tes (P0001) tidak tertukar dengan error yang diharapkan.
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

-- Trigger helpers untuk menguji rollback atomik saat history/audit gagal
create function pg_temp.test_fail_history_insert() returns trigger language plpgsql as $$
begin
  if current_setting('test.fail_history', true) = 'on' then
    raise exception 'simulated history insert failure' using errcode = 'check_violation';
  end if;
  return new;
end;$$;

create trigger trg_test_fail_history before insert on public.membership_histories
  for each row execute function pg_temp.test_fail_history_insert();

create function pg_temp.test_fail_audit_insert() returns trigger language plpgsql as $$
begin
  if current_setting('test.fail_audit', true) = 'on' then
    raise exception 'simulated audit insert failure' using errcode = 'check_violation';
  end if;
  return new;
end;$$;

create trigger trg_test_fail_audit before insert on public.audit_logs
  for each row execute function pg_temp.test_fail_audit_insert();

do $$
declare
  d uuid;
  d_off uuid;
  p uuid;
  p_off uuid;
  o uuid;
  o_end uuid;
  o_up uuid;
  r uuid;
  r2 uuid;
  r3 uuid;
  r_hist_fail uuid;
  r_audit_fail uuid;
  rs uuid;
  ru uuid;
  ra uuid;
  rj uuid;
  r_val uuid;
  r_val2 uuid;
  r_dup uuid;
  r_dup2 uuid;
  r_auth uuid;
  result jsonb;
  v_member_id uuid;
  audit_count int;
  history_count int;
  convert_sql constant text := 'select public.admin_convert_registration_to_member(%L, %L, %L, %L, %L)';
  review_sql constant text := 'select public.admin_review_registration(%L, %L)';
begin
  -- Siapkan data organisasi (pola dari tests/db/organization.sql)
  insert into public.departments (name, slug) values ('Web Dev', 'web-dev-conv') returning id into d;
  insert into public.departments (name, slug, active) values ('Dept Lama', 'dept-lama-conv', false) returning id into d_off;
  insert into public.positions (name, level) values ('Member', 'Staff') returning id into p;
  insert into public.positions (name, level, active) values ('Posisi Lama', 'Staff', false) returning id into p_off;
  insert into public.organization_periods (name, start_date, end_date, status)
    values ('2025/2026', '2025-08-01', '2026-07-31', 'ACTIVE') returning id into o;
  insert into public.organization_periods (name, start_date, end_date, status)
    values ('2020/2021', '2020-08-01', '2021-07-31', 'ENDED') returning id into o_end;
  insert into public.organization_periods (name, start_date, end_date, status)
    values ('2026/2027', '2026-08-01', '2027-07-31', 'UPCOMING') returning id into o_up;

  -- Siapkan registrasi
  insert into public.registrations (
    full_name, nim, email, phone, faculty, study_program, batch
  ) values (
    'Calon Anggota Satu', '10502181001', 'calon1@student.unklab.ac.id',
    '+6281234567890', 'FIK', 'Informatika', 2025
  ) returning id into r;

  -- ============================================================
  -- TEST 1: Review status SUBMITTED → UNDER_REVIEW
  -- ============================================================
  select public.admin_review_registration(r, 'UNDER_REVIEW', 'Berkas lengkap') into result;
  if (result->>'status') <> 'UNDER_REVIEW' then
    raise exception 'TEST 1 GAGAL: status harus UNDER_REVIEW, dapat %', result->>'status';
  end if;

  -- Verifikasi admin_notes tersimpan
  if (select admin_notes from public.registrations where id = r) <> 'Berkas lengkap' then
    raise exception 'TEST 1 GAGAL: admin_notes tidak tersimpan';
  end if;

  -- ============================================================
  -- TEST 2: Review UNDER_REVIEW → ACCEPTED (accepted_at terisi, rejected_at kosong)
  -- ============================================================
  select public.admin_review_registration(r, 'ACCEPTED') into result;
  if (result->>'status') <> 'ACCEPTED' then
    raise exception 'TEST 2 GAGAL: status harus ACCEPTED';
  end if;
  if exists (select 1 from public.registrations where id = r and (accepted_at is null or rejected_at is not null)) then
    raise exception 'TEST 2 GAGAL: accepted_at harus terisi dan rejected_at kosong';
  end if;

  -- ============================================================
  -- TEST 3: Konversi pendaftar ACCEPTED → member ACTIVE
  -- ============================================================
  select public.admin_convert_registration_to_member(
    p_registration_id => r,
    p_organization_period_id => o,
    p_position_id => p,
    p_start_date => '2025-08-15',
    p_department_id => d
  ) into result;

  v_member_id := (result->>'member_id')::uuid;

  -- Verifikasi member berstatus ACTIVE
  if (select status from public.members where id = v_member_id) <> 'ACTIVE' then
    raise exception 'TEST 3 GAGAL: member harus berstatus ACTIVE';
  end if;

  -- Verifikasi membership history terbuat dengan data benar
  if not exists (
    select 1 from public.membership_histories
    where membership_histories.member_id = v_member_id
      and organization_period_id = o
      and department_id = d
      and position_id = p
      and start_date = '2025-08-15'
  ) then
    raise exception 'TEST 3 GAGAL: membership history tidak terbuat';
  end if;

  -- Verifikasi converted_member_id terisi
  if (select converted_member_id from public.registrations where id = r) is null then
    raise exception 'TEST 3 GAGAL: converted_member_id harus terisi';
  end if;

  -- Verifikasi audit tercatat (D13)
  select count(*) into audit_count from public.audit_logs
    where entity_type = 'registration' and entity_id = r and action = 'APPLICANT_CONVERTED';
  if audit_count <> 1 then
    raise exception 'TEST 3 GAGAL: audit APPLICANT_CONVERTED harus tercatat sekali, dapat %', audit_count;
  end if;

  -- ============================================================
  -- TEST 4: Double conversion HARUS GAGAL (D12, scope 6)
  -- ============================================================
  perform pg_temp.expect_error(format(convert_sql, r, o, p, '2025-08-15', d), 'P0001', 'TEST 4 double conversion');

  -- ============================================================
  -- TEST 5: Registrasi yang sudah dikonversi tidak boleh diubah statusnya
  -- ============================================================
  perform pg_temp.expect_error(format(review_sql, r, 'REJECTED'), 'P0001', 'TEST 5 review registrasi terkonversi');

  -- ============================================================
  -- TEST 6: Konversi pendaftar SUBMITTED HARUS GAGAL (D12)
  -- ============================================================
  insert into public.registrations (
    full_name, nim, email, phone, faculty, study_program, batch
  ) values (
    'Calon Submitted', '10502181002', 'calon2@student.unklab.ac.id',
    '+6281234567891', 'FIK', 'Informatika', 2025
  ) returning id into r2;

  perform pg_temp.expect_error(format(convert_sql, r2, o, p, '2025-08-15', d), 'P0001', 'TEST 6 konversi SUBMITTED');

  -- ============================================================
  -- TEST 7: Konversi pendaftar REJECTED HARUS GAGAL (D12)
  -- ============================================================
  insert into public.registrations (
    full_name, nim, email, phone, faculty, study_program, batch, status
  ) values (
    'Calon Rejected', '10502181003', 'calon3@student.unklab.ac.id',
    '+6281234567892', 'FIK', 'Informatika', 2025, 'REJECTED'
  ) returning id into r3;

  perform pg_temp.expect_error(format(convert_sql, r3, o, p, '2025-08-15', d), 'P0001', 'TEST 7 konversi REJECTED');

  -- ============================================================
  -- TEST 8: U01 — Konversi tanpa departemen (pengurus inti)
  -- ============================================================
  perform public.admin_review_registration(r2, 'UNDER_REVIEW');
  perform public.admin_review_registration(r2, 'ACCEPTED');
  select public.admin_convert_registration_to_member(
    p_registration_id => r2,
    p_organization_period_id => o,
    p_position_id => p,
    p_start_date => '2025-08-15'
  ) into result;

  -- Verifikasi membership_history terbuat dengan department_id NULL
  if not exists (
    select 1 from public.membership_histories
    where member_id = (result->>'member_id')::uuid
      and department_id is null
  ) then
    raise exception 'TEST 8 GAGAL: pengurus inti harus bisa tanpa departemen (U01)';
  end if;

  -- ============================================================
  -- TEST 9A: History preservation (D14)
  --   Mengubah status member tidak menghapus membership_histories
  -- ============================================================
  update public.members set status = 'ALUMNI' where id = v_member_id;
  if not exists (
    select 1 from public.membership_histories where membership_histories.member_id = v_member_id
  ) then
    raise exception 'TEST 9A GAGAL: membership history harus tetap ada setelah perubahan status (D14)';
  end if;

  -- Soft delete member tetap mempertahankan membership history
  update public.members set deleted_at = statement_timestamp() where id = v_member_id;
  if not exists (
    select 1 from public.membership_histories where membership_histories.member_id = v_member_id
  ) then
    raise exception 'TEST 9A GAGAL: membership history harus tetap ada setelah soft delete (D14)';
  end if;

  -- Hard delete member DITOLAK oleh ON DELETE RESTRICT (D14)
  begin
    delete from public.members where id = v_member_id;
    raise exception 'TEST 9A GAGAL: hard delete member harus ditolak ON DELETE RESTRICT';
  exception when foreign_key_violation or restrict_violation then
    null; -- Benar: ON DELETE RESTRICT melindungi history (23503 di PG<=17, 23001 di PG>=18)
  end;

  -- ============================================================
  -- TEST 9B: Rollback on history failure (Scope 5, transactional)
  -- ============================================================
  insert into public.registrations (
    full_name, nim, email, phone, faculty, study_program, batch, status
  ) values (
    'Calon History Fail', '10502181091', 'calon_hf@student.unklab.ac.id',
    '+6281234567895', 'FIK', 'Informatika', 2025, 'ACCEPTED'
  ) returning id into r_hist_fail;

  perform set_config('test.fail_history', 'on', true);
  perform pg_temp.expect_error(format(convert_sql, r_hist_fail, o, p, '2025-08-15', d), '23514', 'TEST 9B history gagal');
  perform set_config('test.fail_history', 'off', true);

  -- Verifikasi rollback: member tidak terbuat, registrasi belum dikonversi, audit tidak tercatat
  if exists (select 1 from public.members where nim = '10502181091') then
    raise exception 'TEST 9B GAGAL: rollback gagal, member terbuat padahal history gagal';
  end if;
  if (select converted_member_id from public.registrations where id = r_hist_fail) is not null then
    raise exception 'TEST 9B GAGAL: rollback gagal, converted_member_id terisi padahal history gagal';
  end if;
  if exists (select 1 from public.audit_logs where entity_id = r_hist_fail and action = 'APPLICANT_CONVERTED') then
    raise exception 'TEST 9B GAGAL: rollback gagal, audit APPLICANT_CONVERTED tercatat padahal history gagal';
  end if;

  -- ============================================================
  -- TEST 9C: Rollback on audit failure (Scope 5, atomic audit)
  -- ============================================================
  insert into public.registrations (
    full_name, nim, email, phone, faculty, study_program, batch, status
  ) values (
    'Calon Audit Fail', '10502181092', 'calon_af@student.unklab.ac.id',
    '+6281234567896', 'FIK', 'Informatika', 2025, 'ACCEPTED'
  ) returning id into r_audit_fail;

  select count(*) into history_count from public.membership_histories;
  perform set_config('test.fail_audit', 'on', true);
  perform pg_temp.expect_error(format(convert_sql, r_audit_fail, o, p, '2025-08-15', d), '23514', 'TEST 9C audit gagal');
  perform set_config('test.fail_audit', 'off', true);

  -- Verifikasi rollback: member tidak terbuat, history tidak terbuat, registrasi belum dikonversi
  if exists (select 1 from public.members where nim = '10502181092') then
    raise exception 'TEST 9C GAGAL: rollback gagal, member terbuat padahal audit gagal';
  end if;
  if (select count(*) from public.membership_histories) <> history_count then
    raise exception 'TEST 9C GAGAL: rollback gagal, membership history terbuat padahal audit gagal';
  end if;
  if (select converted_member_id from public.registrations where id = r_audit_fail) is not null then
    raise exception 'TEST 9C GAGAL: rollback gagal, converted_member_id terisi padahal audit gagal';
  end if;

  -- ============================================================
  -- TEST 14: Transisi di luar diagram issue #29 ditolak (P0001)
  -- ============================================================
  insert into public.registrations (full_name, nim, email, phone, faculty, study_program, batch, status, admin_notes)
    values ('Transisi Submitted', '10502181101', 'ts@student.unklab.ac.id', '+6281234567801', 'FIK', 'Informatika', 2025, 'SUBMITTED', 'awal')
    returning id into rs;
  insert into public.registrations (full_name, nim, email, phone, faculty, study_program, batch, status)
    values ('Transisi Review', '10502181102', 'tu@student.unklab.ac.id', '+6281234567802', 'FIK', 'Informatika', 2025, 'UNDER_REVIEW')
    returning id into ru;
  insert into public.registrations (full_name, nim, email, phone, faculty, study_program, batch, status, accepted_at)
    values ('Transisi Accepted', '10502181103', 'ta@student.unklab.ac.id', '+6281234567803', 'FIK', 'Informatika', 2025, 'ACCEPTED', statement_timestamp())
    returning id into ra;
  insert into public.registrations (full_name, nim, email, phone, faculty, study_program, batch, status, rejected_at)
    values ('Transisi Rejected', '10502181104', 'tj@student.unklab.ac.id', '+6281234567804', 'FIK', 'Informatika', 2025, 'REJECTED', statement_timestamp())
    returning id into rj;

  perform pg_temp.expect_error(format(review_sql, rs, 'ACCEPTED'), 'P0001', 'TEST 14 SUBMITTED->ACCEPTED');
  perform pg_temp.expect_error(format(review_sql, rs, 'REJECTED'), 'P0001', 'TEST 14 SUBMITTED->REJECTED');
  perform pg_temp.expect_error(format(review_sql, ru, 'SUBMITTED'), 'P0001', 'TEST 14 UNDER_REVIEW->SUBMITTED');
  perform pg_temp.expect_error(format(review_sql, ra, 'SUBMITTED'), 'P0001', 'TEST 14 ACCEPTED->SUBMITTED');
  perform pg_temp.expect_error(format(review_sql, ra, 'UNDER_REVIEW'), 'P0001', 'TEST 14 ACCEPTED->UNDER_REVIEW');
  perform pg_temp.expect_error(format(review_sql, ra, 'REJECTED'), 'P0001', 'TEST 14 ACCEPTED->REJECTED');
  perform pg_temp.expect_error(format(review_sql, rj, 'SUBMITTED'), 'P0001', 'TEST 14 REJECTED->SUBMITTED');
  perform pg_temp.expect_error(format(review_sql, rj, 'UNDER_REVIEW'), 'P0001', 'TEST 14 REJECTED->UNDER_REVIEW');
  perform pg_temp.expect_error(format(review_sql, rj, 'ACCEPTED'), 'P0001', 'TEST 14 REJECTED->ACCEPTED');
  perform pg_temp.expect_error(format(review_sql, ru, 'APPROVED'), 'P0001', 'TEST 14 status tidak dikenal');
  perform pg_temp.expect_error(format(review_sql, ru, null), 'P0001', 'TEST 14 status null');
  perform pg_temp.expect_error(format(review_sql, gen_random_uuid(), 'UNDER_REVIEW'), 'P0002', 'TEST 14 registrasi tidak ada');

  -- UNDER_REVIEW → REJECTED mengisi rejected_at dan mengosongkan accepted_at
  perform public.admin_review_registration(ru, 'REJECTED');
  if exists (select 1 from public.registrations where id = ru and (rejected_at is null or accepted_at is not null)) then
    raise exception 'TEST 14 GAGAL: rejected_at harus terisi dan accepted_at kosong';
  end if;

  -- ============================================================
  -- TEST 15: Catatan admin — null mempertahankan, '' menghapus, no-op tanpa audit
  -- ============================================================
  select count(*) into audit_count from public.audit_logs where entity_id = rs and action = 'REGISTRATION_REVIEWED';
  perform public.admin_review_registration(rs, 'SUBMITTED', null);
  if (select admin_notes from public.registrations where id = rs) <> 'awal' then
    raise exception 'TEST 15 GAGAL: catatan null harus mempertahankan catatan lama';
  end if;
  if (select count(*) from public.audit_logs where entity_id = rs and action = 'REGISTRATION_REVIEWED') <> audit_count then
    raise exception 'TEST 15 GAGAL: review tanpa perubahan tidak boleh menulis audit';
  end if;

  perform public.admin_review_registration(rs, 'SUBMITTED', 'baru');
  if (select admin_notes from public.registrations where id = rs) <> 'baru' then
    raise exception 'TEST 15 GAGAL: catatan baru tidak tersimpan';
  end if;
  if not exists (
    select 1 from public.audit_logs
    where entity_type = 'registration' and entity_id = rs and action = 'REGISTRATION_REVIEWED'
      and new_values = '{"status": "SUBMITTED", "notes_changed": true}'::jsonb
  ) then
    raise exception 'TEST 15 GAGAL: perubahan catatan harus diaudit dengan notes_changed';
  end if;

  perform public.admin_review_registration(rs, 'SUBMITTED', '');
  if (select admin_notes from public.registrations where id = rs) is not null then
    raise exception 'TEST 15 GAGAL: string kosong harus menghapus catatan';
  end if;

  -- ============================================================
  -- TEST 16: Validasi konversi — periode, rentang tanggal, posisi, departemen, identitas
  -- ============================================================
  insert into public.registrations (full_name, nim, email, phone, faculty, study_program, batch, status)
    values ('Calon Validasi', '10502181201', 'val@student.unklab.ac.id', '+6281234567811', 'FIK', 'Informatika', 2025, 'ACCEPTED')
    returning id into r_val;

  perform pg_temp.expect_error(format(convert_sql, r_val, o_end, p, '2020-09-01', d), 'P0001', 'TEST 16 periode ENDED');
  perform pg_temp.expect_error(format(convert_sql, r_val, o, p, '2025-07-31', d), 'P0001', 'TEST 16 start sebelum periode');
  perform pg_temp.expect_error(format(convert_sql, r_val, o, p, '2026-08-01', d), 'P0001', 'TEST 16 start setelah periode');
  perform pg_temp.expect_error(format(convert_sql, r_val, o, p, null, d), 'P0001', 'TEST 16 start null');
  perform pg_temp.expect_error(format(convert_sql, r_val, o, p_off, '2025-08-15', d), 'P0001', 'TEST 16 posisi nonaktif');
  perform pg_temp.expect_error(format(convert_sql, r_val, o, p, '2025-08-15', d_off), 'P0001', 'TEST 16 departemen nonaktif');
  perform pg_temp.expect_error(format(convert_sql, r_val, gen_random_uuid(), p, '2025-08-15', d), 'P0002', 'TEST 16 periode tidak ada');
  perform pg_temp.expect_error(format(convert_sql, r_val, o, gen_random_uuid(), '2025-08-15', d), 'P0002', 'TEST 16 posisi tidak ada');
  perform pg_temp.expect_error(format(convert_sql, r_val, o, p, '2025-08-15', gen_random_uuid()), 'P0002', 'TEST 16 departemen tidak ada');
  perform pg_temp.expect_error(format(convert_sql, gen_random_uuid(), o, p, '2025-08-15', d), 'P0002', 'TEST 16 registrasi tidak ada');

  -- Batas rentang diterima: hari pertama periode UPCOMING, hari terakhir periode ACTIVE
  perform public.admin_convert_registration_to_member(
    p_registration_id => r_val, p_organization_period_id => o_up, p_position_id => p,
    p_start_date => '2026-08-01', p_department_id => d);
  insert into public.registrations (full_name, nim, email, phone, faculty, study_program, batch, status)
    values ('Calon Validasi Dua', '10502181202', 'val2@student.unklab.ac.id', '+6281234567812', 'FIK', 'Informatika', 2025, 'ACCEPTED')
    returning id into r_val2;
  perform public.admin_convert_registration_to_member(
    p_registration_id => r_val2, p_organization_period_id => o, p_position_id => p,
    p_start_date => '2026-07-31');

  -- NIM atau email yang sudah dipakai member ditolak dengan P0001, bukan unique_violation
  insert into public.registrations (full_name, nim, email, phone, faculty, study_program, batch, status)
    values ('Calon NIM Ganda', '10502181001', 'dup@student.unklab.ac.id', '+6281234567813', 'FIK', 'Informatika', 2025, 'ACCEPTED')
    returning id into r_dup;
  perform pg_temp.expect_error(format(convert_sql, r_dup, o, p, '2025-08-15', d), 'P0001', 'TEST 16 NIM sudah member');
  insert into public.registrations (full_name, nim, email, phone, faculty, study_program, batch, status)
    values ('Calon Email Ganda', '10502181203', 'calon1@student.unklab.ac.id', '+6281234567814', 'FIK', 'Informatika', 2025, 'ACCEPTED')
    returning id into r_dup2;
  perform pg_temp.expect_error(format(convert_sql, r_dup2, o, p, '2025-08-15', d), 'P0001', 'TEST 16 email sudah member');

  -- Fixture untuk TEST 17 (jalur admin sebagai role authenticated)
  insert into public.registrations (full_name, nim, email, phone, faculty, study_program, batch)
    values ('Calon Lewat API', '10502181301', 'api@student.unklab.ac.id', '+6281234567821', 'FIK', 'Informatika', 2025)
    returning id into r_auth;
  perform set_config('test.reg_auth', r_auth::text, true);
  perform set_config('test.period', o::text, true);
  perform set_config('test.position', p::text, true);
end$$;

-- ============================================================
-- TEST 17: Admin memanggil kedua RPC sebagai role authenticated (grant + RLS nyata)
-- ============================================================
set local role authenticated;
do $$
begin
  perform public.admin_review_registration(current_setting('test.reg_auth')::uuid, 'UNDER_REVIEW', 'via API');
  perform public.admin_review_registration(current_setting('test.reg_auth')::uuid, 'ACCEPTED');
  perform public.admin_convert_registration_to_member(
    p_registration_id => current_setting('test.reg_auth')::uuid,
    p_organization_period_id => current_setting('test.period')::uuid,
    p_position_id => current_setting('test.position')::uuid,
    p_start_date => '2025-09-01');
end$$;
reset role;
do $$
begin
  if not exists (select 1 from public.members where nim = '10502181301' and status = 'ACTIVE') then
    raise exception 'TEST 17 GAGAL: admin authenticated harus bisa mengonversi';
  end if;
end$$;

-- ============================================================
-- TEST 12: Grant EXECUTE per role
-- ============================================================
do $$
begin
  if has_function_privilege('anon', 'public.admin_review_registration(uuid, text, text)', 'execute')
    or has_function_privilege('anon', 'public.admin_convert_registration_to_member(uuid, uuid, uuid, date, uuid)', 'execute') then
    raise exception 'TEST 12 GAGAL: anon tidak boleh punya EXECUTE pada RPC admin';
  end if;
  if not has_function_privilege('authenticated', 'public.admin_review_registration(uuid, text, text)', 'execute')
    or not has_function_privilege('authenticated', 'public.admin_convert_registration_to_member(uuid, uuid, uuid, date, uuid)', 'execute') then
    raise exception 'TEST 12 GAGAL: authenticated wajib punya EXECUTE pada RPC admin';
  end if;
end$$;

-- ============================================================
-- TEST 10: RLS — Non-admin tidak bisa membaca registrasi
-- ============================================================
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002"}', true);
set local role authenticated;
do $$
begin
  if exists (select 1 from public.registrations) then
    raise exception 'TEST 10 GAGAL: non-admin seharusnya tidak bisa baca registrasi';
  end if;
end$$;

-- ============================================================
-- TEST 12B: Non-admin ditolak oleh cek sesi, bukan oleh grant
-- ============================================================
do $$
declare denied int := 0;
begin
  begin
    perform public.admin_review_registration(gen_random_uuid(), 'UNDER_REVIEW');
  exception when insufficient_privilege then
    if sqlerrm = 'insufficient_privilege' then denied := denied + 1; end if;
  end;
  begin
    perform public.admin_convert_registration_to_member(gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), '2025-08-15');
  exception when insufficient_privilege then
    if sqlerrm = 'insufficient_privilege' then denied := denied + 1; end if;
  end;
  if denied <> 2 then
    raise exception 'TEST 12B GAGAL: kedua RPC harus ditolak cek sesi admin, dapat %', denied;
  end if;
end$$;
reset role;

-- ============================================================
-- TEST 11: RLS — anon tidak bisa akses registrasi
-- ============================================================
set local role anon;
do $$
begin
  begin
    perform id from public.registrations;
    raise exception 'TEST 11 GAGAL: anon seharusnya tidak bisa akses registrasi';
  exception when insufficient_privilege then
    null; -- Benar: ditolak
  end;
end$$;

-- ============================================================
-- TEST 13: anon dan service_role tanpa sesi admin tidak bisa memanggil RPC
-- ============================================================
do $$
declare denied int := 0;
begin
  begin
    perform public.admin_review_registration(gen_random_uuid(), 'UNDER_REVIEW');
  exception when insufficient_privilege then denied := denied + 1;
  end;
  begin
    perform public.admin_convert_registration_to_member(gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), '2025-08-15');
  exception when insufficient_privilege then denied := denied + 1;
  end;
  if denied <> 2 then
    raise exception 'TEST 13 GAGAL: anon harus ditolak di kedua RPC, dapat %', denied;
  end if;
end$$;
reset role;
set local role service_role;
do $$
begin
  begin
    perform public.admin_review_registration(gen_random_uuid(), 'UNDER_REVIEW');
    raise exception 'TEST 13 GAGAL: service_role tanpa sesi admin berhasil memanggil RPC review';
  exception when insufficient_privilege then
    null; -- Benar: ditolak grant atau cek sesi
  end;
end$$;
reset role;

rollback;
