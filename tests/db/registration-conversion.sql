-- Tes: Registration review & member conversion (Issue #29)
-- Acceptance criteria yang diuji:
--   ✓ Status transition tervalidasi
--   ✓ Admin notes tersedia
--   ✓ Hanya ACCEPTED yang dapat dikonversi (D12)
--   ✓ Double conversion tidak mungkin terjadi (D12, scope 6)
--   ✓ Conversion membuat member ACTIVE + membership history
--   ✓ Conversion + audit atomic (D13)
--   ✓ U01: department_id nullable (pengurus inti)
--   ✓ Private registration data tidak dapat diakses public

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
  p uuid;
  o uuid;
  r uuid;
  r2 uuid;
  r3 uuid;
  r_hist_fail uuid;
  r_audit_fail uuid;
  result jsonb;
  v_member_id uuid;
  audit_count int;
begin
  -- Siapkan data organisasi (pola dari tests/db/organization.sql)
  insert into public.departments (name, slug) values ('Web Dev', 'web-dev-conv') returning id into d;
  insert into public.positions (name, level) values ('Member', 'Staff') returning id into p;
  insert into public.organization_periods (name, start_date, end_date, status)
    values ('2025/2026', '2025-08-01', '2026-07-31', 'ACTIVE') returning id into o;

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
  -- TEST 2: Review UNDER_REVIEW → ACCEPTED (accepted_at terisi)
  -- ============================================================
  select public.admin_review_registration(r, 'ACCEPTED', null) into result;
  if (result->>'status') <> 'ACCEPTED' then
    raise exception 'TEST 2 GAGAL: status harus ACCEPTED';
  end if;
  if (select accepted_at from public.registrations where id = r) is null then
    raise exception 'TEST 2 GAGAL: accepted_at harus terisi';
  end if;

  -- ============================================================
  -- TEST 3: Konversi pendaftar ACCEPTED → member ACTIVE
  -- ============================================================
  select public.admin_convert_registration_to_member(
    r, o, d, p, '2025-08-15'
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
  ) then
    raise exception 'TEST 3 GAGAL: membership history tidak terbuat';
  end if;

  -- Verifikasi converted_member_id terisi
  if (select converted_member_id from public.registrations where id = r) is null then
    raise exception 'TEST 3 GAGAL: converted_member_id harus terisi';
  end if;

  -- Verifikasi audit tercatat (D13)
  select count(*) into audit_count from public.audit_logs
    where entity_type = 'registrations' and entity_id = r and action = 'APPLICANT_CONVERTED';
  if audit_count < 1 then
    raise exception 'TEST 3 GAGAL: audit APPLICANT_CONVERTED tidak tercatat';
  end if;

  -- ============================================================
  -- TEST 4: Double conversion HARUS GAGAL (D12, scope 6)
  -- ============================================================
  begin
    perform public.admin_convert_registration_to_member(r, o, d, p, '2025-08-15');
    raise exception 'TEST 4 GAGAL: double conversion seharusnya ditolak';
  exception when check_violation then
    null; -- Benar: ditolak
  end;

  -- ============================================================
  -- TEST 5: Registrasi yang sudah dikonversi tidak boleh diubah statusnya
  -- ============================================================
  begin
    perform public.admin_review_registration(r, 'REJECTED', null);
    raise exception 'TEST 5 GAGAL: review konversi seharusnya ditolak';
  exception when check_violation then
    null; -- Benar: ditolak
  end;

  -- ============================================================
  -- TEST 6: Konversi pendaftar SUBMITTED HARUS GAGAL (D12)
  -- ============================================================
  insert into public.registrations (
    full_name, nim, email, phone, faculty, study_program, batch
  ) values (
    'Calon Submitted', '10502181002', 'calon2@student.unklab.ac.id',
    '+6281234567891', 'FIK', 'Informatika', 2025
  ) returning id into r2;

  begin
    perform public.admin_convert_registration_to_member(r2, o, d, p, '2025-08-15');
    raise exception 'TEST 6 GAGAL: konversi SUBMITTED seharusnya ditolak';
  exception when check_violation then
    null; -- Benar: hanya ACCEPTED yang boleh
  end;

  -- ============================================================
  -- TEST 7: Konversi pendaftar REJECTED HARUS GAGAL (D12)
  -- ============================================================
  insert into public.registrations (
    full_name, nim, email, phone, faculty, study_program, batch, status
  ) values (
    'Calon Rejected', '10502181003', 'calon3@student.unklab.ac.id',
    '+6281234567892', 'FIK', 'Informatika', 2025, 'REJECTED'
  ) returning id into r3;

  begin
    perform public.admin_convert_registration_to_member(r3, o, d, p, '2025-08-15');
    raise exception 'TEST 7 GAGAL: konversi REJECTED seharusnya ditolak';
  exception when check_violation then
    null; -- Benar: hanya ACCEPTED yang boleh
  end;

  -- ============================================================
  -- TEST 8: U01 — Konversi tanpa departemen (pengurus inti)
  -- ============================================================
  select public.admin_review_registration(r2, 'ACCEPTED', null) into result;
  select public.admin_convert_registration_to_member(
    r2, o, null, p, '2025-08-15'
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
  exception when foreign_key_violation then
    null; -- Benar: ON DELETE RESTRICT melindungi history
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
  begin
    perform public.admin_convert_registration_to_member(r_hist_fail, o, d, p, '2025-08-15');
    raise exception 'TEST 9B GAGAL: seharusnya gagal saat insert membership history';
  exception when check_violation then
    null; -- Benar: gagal di trigger history
  end;
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

  perform set_config('test.fail_audit', 'on', true);
  begin
    perform public.admin_convert_registration_to_member(r_audit_fail, o, d, p, '2025-08-15');
    raise exception 'TEST 9C GAGAL: seharusnya gagal saat insert audit';
  exception when check_violation then
    null; -- Benar: gagal di trigger audit
  end;
  perform set_config('test.fail_audit', 'off', true);

  -- Verifikasi rollback: member tidak terbuat, history tidak terbuat, registrasi belum dikonversi
  if exists (select 1 from public.members where nim = '10502181092') then
    raise exception 'TEST 9C GAGAL: rollback gagal, member terbuat padahal audit gagal';
  end if;
  if (select converted_member_id from public.registrations where id = r_audit_fail) is not null then
    raise exception 'TEST 9C GAGAL: rollback gagal, converted_member_id terisi padahal audit gagal';
  end if;

end$$;

-- ============================================================
-- TEST 10: RLS — Non-admin tidak bisa membaca registrasi
-- ============================================================
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002"}', true);
set local role authenticated;
do $$
begin
  if exists (select 1 from public.registrations) then
    raise exception 'TEST 10 GAGAL: non-admin seharusnya tidak bisa baca registrasi';
  end if;
end$$;

-- ============================================================
-- TEST 11: RLS — anon tidak bisa akses registrasi
-- ============================================================
reset role;
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
-- TEST 12: RLS — Non-admin tidak bisa memanggil RPC review
-- ============================================================
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002"}', true);
set local role authenticated;
do $$
begin
  begin
    perform public.admin_review_registration(
      '00000000-0000-4000-8000-000000000099', 'UNDER_REVIEW', null
    );
    raise exception 'TEST 12 GAGAL: non-admin seharusnya tidak bisa memanggil RPC review';
  exception when insufficient_privilege then
    null; -- Benar: ditolak
  end;
end$$;
reset role;

rollback;
