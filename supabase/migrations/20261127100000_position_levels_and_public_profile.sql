-- Migration: Position levels (D29), non-core department requirement (D24), and opt-in public_profile default (D31)
-- Issue: #74 (S3-BE-04)
-- Keputusan yang diterapkan:
--   D24 -> Posisi selain CORE dan ADVISOR wajib memiliki departemen saat konversi anggota.
--   D29 -> positions.level dibatasi CHECK constraint ke nilai kanonis guidebook (PRD §31).
--   D31 -> Default members.public_profile menjadi false (opt-in); nilai baris lama diputuskan PM sebelum ke hosted.

-- ============================================================
-- 1. D29: Pemetaan nilai level lama dan CHECK constraint baku pada public.positions
-- ============================================================
-- Petakan nilai teks bebas yang mungkin sudah ada tanpa menyentuh baris yang sudah kanonis.
-- Nilai tak dikenal dibiarkan apa adanya agar ADD CONSTRAINT gagal secara atomik (fail-closed).
update public.positions
set level = case upper(regexp_replace(btrim(level), '[\s-]+', '_', 'g'))
  when 'ADVISOR' then 'ADVISOR'
  when 'PEMBINA' then 'ADVISOR'
  when 'CORE' then 'CORE'
  when 'CORE_TEAM' then 'CORE'
  when 'EXECUTIVE' then 'CORE'
  when 'INTI' then 'CORE'
  when 'PENGURUS_INTI' then 'CORE'
  when 'STEERING_HELPER' then 'STEERING_HELPER'
  when 'COORDINATOR' then 'COORDINATOR'
  when 'KOORDINATOR' then 'COORDINATOR'
  when 'MANAGEMENT' then 'COORDINATOR'
  when 'PIC' then 'PIC'
  when 'PERSON_IN_CHARGE' then 'PIC'
  when 'MEMBER' then 'MEMBER'
  when 'STAFF' then 'MEMBER'
  when 'ANGGOTA' then 'MEMBER'
  else level
end
where level not in (
  'ADVISOR', 'CORE', 'STEERING_HELPER', 'COORDINATOR', 'PIC', 'MEMBER'
);

alter table public.positions
  drop constraint if exists positions_level_check;

alter table public.positions
  add constraint positions_level_check check (
    level in (
      'ADVISOR',
      'CORE',
      'STEERING_HELPER',
      'COORDINATOR',
      'PIC',
      'MEMBER'
    )
  );

-- ============================================================
-- 2. D24: Posisi selain CORE dan ADVISOR wajib memiliki departemen di admin_convert_registration_to_member
-- ============================================================
create or replace function public.admin_convert_registration_to_member(
  p_registration_id uuid,
  p_organization_period_id uuid,
  p_position_id uuid,
  p_start_date date,
  p_department_id uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  reg public.registrations;
  period public.organization_periods;
  pos public.positions;
  is_active boolean;
  new_member_id uuid;
  new_history_id uuid;
begin
  -- Cek sesi admin aktif
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  -- Kunci baris pendaftar (mencegah double conversion konkuren)
  select * into reg from public.registrations
    where id = p_registration_id for update;
  if not found then
    raise no_data_found;
  end if;

  -- Hanya ACCEPTED yang boleh dikonversi (D12)
  if reg.status <> 'ACCEPTED' then
    raise exception 'Hanya pendaftar berstatus ACCEPTED yang dapat dikonversi';
  end if;

  -- Cegah konversi ganda (D12)
  if reg.converted_member_id is not null then
    raise exception 'Pendaftar sudah pernah dikonversi';
  end if;

  -- Periode belum berakhir dan tanggal mulai di dalam rentangnya (PRD §65)
  select * into period from public.organization_periods where id = p_organization_period_id;
  if not found then
    raise exception 'Periode organisasi tidak ditemukan' using errcode = 'no_data_found';
  end if;
  if period.status = 'ENDED' then
    raise exception 'Periode organisasi sudah berakhir';
  end if;
  if p_start_date is null or p_start_date not between period.start_date and period.end_date then
    raise exception 'Tanggal mulai harus berada dalam periode organisasi';
  end if;

  -- Posisi harus ada dan aktif
  select * into pos from public.positions where id = p_position_id;
  if not found then
    raise exception 'Posisi tidak ditemukan' using errcode = 'no_data_found';
  end if;
  if not pos.active then
    raise exception 'Posisi tidak aktif';
  end if;

  -- D24 + D29: posisi selain CORE dan ADVISOR wajib memiliki departemen.
  if pos.level not in ('CORE', 'ADVISOR') and p_department_id is null then
    raise exception 'Posisi level % wajib memiliki departemen', pos.level
      using errcode = 'check_violation';
  end if;

  if p_department_id is not null then
    select active into is_active from public.departments where id = p_department_id;
    if not found then
      raise exception 'Departemen tidak ditemukan' using errcode = 'no_data_found';
    end if;
    if not is_active then
      raise exception 'Departemen tidak aktif';
    end if;
  end if;

  -- members.nim dan members.email unik (D09); tolak dengan alasan jelas, bukan unique_violation.
  if exists (select 1 from public.members m where m.nim = reg.nim or m.email = reg.email) then
    raise exception 'NIM atau email sudah terdaftar sebagai member';
  end if;

  -- Buat member baru berstatus ACTIVE (PRD §9 lifecycle); public_profile mengikuti default tabel (false, D31).
  insert into public.members (
    full_name, nim, email, phone, faculty, study_program,
    batch, photo, status, joined_at
  ) values (
    reg.full_name, reg.nim, reg.email, reg.phone,
    reg.faculty, reg.study_program, reg.batch, reg.photo,
    'ACTIVE', p_start_date::timestamptz
  ) returning id into new_member_id;

  -- Buat membership history (D14: tidak pernah dihapus)
  insert into public.membership_histories (
    member_id, organization_period_id, department_id, position_id, start_date
  ) values (
    new_member_id, p_organization_period_id,
    p_department_id, p_position_id, p_start_date
  ) returning id into new_history_id;

  -- Hubungkan registrasi ke member baru
  update public.registrations
    set converted_member_id = new_member_id
    where id = reg.id;

  -- Audit persisten atomik (D13)
  perform private.write_audit(
    auth.uid(),
    'APPLICANT_CONVERTED',
    'registration',
    reg.id,
    '{}'::jsonb,
    jsonb_build_object(
      'member_id', new_member_id,
      'organization_period_id', p_organization_period_id,
      'department_id', p_department_id,
      'position_id', p_position_id
    )
  );

  return jsonb_build_object(
    'member_id', new_member_id,
    'membership_history_id', new_history_id,
    'registration_id', reg.id
  );
end;
$$;

revoke all on function public.admin_convert_registration_to_member(uuid, uuid, uuid, date, uuid)
  from public, anon, service_role;
grant execute on function public.admin_convert_registration_to_member(uuid, uuid, uuid, date, uuid)
  to authenticated;

-- ============================================================
-- 3. D31: Default members.public_profile menjadi false (opt-in)
--    Nilai baris lama sengaja tidak diubah; keputusannya dilakukan PM sebelum migration ke hosted.
-- ============================================================
alter table public.members
  alter column public_profile set default false;
