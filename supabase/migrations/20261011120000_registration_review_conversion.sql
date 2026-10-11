-- Migration: Registration review & member conversion workflow
-- Issue: #29 (S2-BE-02)
-- Keputusan yang diterapkan:
--   D12  → Hanya ACCEPTED yang boleh dikonversi; 1 registration = max 1 member
--   D13  → Mutasi lewat fungsi SQL ter-audit, bukan UPDATE langsung
--   D14  → membership_histories ON DELETE RESTRICT; member soft delete
--   U01  → department_id nullable (pengurus inti tanpa departemen)
-- Referensi: PRD §9, §45; BACKEND_CONVENTIONS.md §Auth/database/audit

-- ============================================================
-- 1. U01: Pengurus inti boleh tanpa departemen
--    Contoh: Presiden, Wakil, Sekretaris, Bendahara
--    tidak berada di departemen manapun.
--    Lihat: DECISIONS.md U01, PRD §13
-- ============================================================
alter table public.membership_histories
  alter column department_id drop not null;

-- ============================================================
-- 2. RPC: Admin review registration (ubah status & catatan)
--    Pola: ARCHITECTURE.md §4.3
--      Server Action → requireAdmin → Zod → RPC SQL
--      Di dalam satu transaksi: cek sesi → validasi → UPDATE → audit
-- ============================================================
create function public.admin_review_registration(
  p_registration_id uuid,
  p_status text,
  p_admin_notes text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  reg public.registrations;
  old_status text;
begin
  -- Cek sesi admin aktif (BACKEND_CONVENTIONS.md §Auth)
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  -- Kunci baris untuk mencegah modifikasi konkuren
  select * into reg from public.registrations
    where id = p_registration_id for update;
  if not found then
    raise no_data_found;
  end if;

  -- Validasi status baru
  if p_status not in ('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED') then
    raise exception 'Status tidak valid' using errcode = 'check_violation';
  end if;

  -- Registrasi yang sudah dikonversi tidak boleh diubah statusnya (D12)
  if reg.converted_member_id is not null then
    raise exception 'Registrasi yang sudah dikonversi tidak dapat diubah' using errcode = 'check_violation';
  end if;

  old_status := reg.status;

  -- Update status + timestamp + catatan admin
  update public.registrations set
    status       = p_status,
    admin_notes  = coalesce(p_admin_notes, admin_notes),
    accepted_at  = case
                     when p_status = 'ACCEPTED' and old_status <> 'ACCEPTED'
                       then statement_timestamp()
                     when p_status in ('SUBMITTED','UNDER_REVIEW')
                       then null
                     else accepted_at
                   end,
    rejected_at  = case
                     when p_status = 'REJECTED' and old_status <> 'REJECTED'
                       then statement_timestamp()
                     when p_status in ('SUBMITTED','UNDER_REVIEW')
                       then null
                     else rejected_at
                   end
  where id = reg.id
  returning * into reg;

  -- Catat audit persisten (D13, BACKEND_CONVENTIONS.md §Auth/audit)
  perform private.write_audit(
    auth.uid(),
    'REGISTRATION_REVIEWED',
    'registrations',
    reg.id,
    jsonb_build_object('status', old_status),
    jsonb_build_object('status', p_status)
  );

  return jsonb_build_object('id', reg.id, 'status', reg.status);
end;
$$;

-- Cabut EXECUTE dari public (BACKEND_CONVENTIONS.md: cabut EXECUTE PUBLIC)
revoke all on function public.admin_review_registration(uuid, text, text)
  from public, anon;
grant execute on function public.admin_review_registration(uuid, text, text)
  to authenticated;

-- ============================================================
-- 3. RPC: Konversi pendaftar ACCEPTED menjadi member ACTIVE
--    Alur atomik (D12, D13, issue #29 scope 5):
--      verify admin → lock registration → require ACCEPTED
--      → ensure not converted → create member ACTIVE
--      → create membership_history → set converted_member_id
--      → write audit → commit
-- ============================================================
create function public.admin_convert_registration_to_member(
  p_registration_id uuid,
  p_organization_period_id uuid,
  p_department_id uuid,
  p_position_id uuid,
  p_start_date text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  reg public.registrations;
  new_member_id uuid;
  new_history_id uuid;
  resolved_start date;
begin
  -- Cek sesi admin aktif
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  -- Kunci baris pendaftar (mencegah double conversion konkuren, scope 6)
  select * into reg from public.registrations
    where id = p_registration_id for update;
  if not found then
    raise no_data_found;
  end if;

  -- Hanya ACCEPTED yang boleh dikonversi (D12)
  if reg.status <> 'ACCEPTED' then
    raise exception 'Hanya pendaftar berstatus ACCEPTED yang dapat dikonversi'
      using errcode = 'check_violation';
  end if;

  -- Cegah konversi ganda (D12, scope 6)
  if reg.converted_member_id is not null then
    raise exception 'Pendaftar sudah pernah dikonversi'
      using errcode = 'check_violation';
  end if;

  -- Validasi referensi FK
  if not exists (
    select 1 from public.organization_periods where id = p_organization_period_id
  ) then
    raise exception 'Periode organisasi tidak ditemukan'
      using errcode = 'foreign_key_violation';
  end if;

  if not exists (
    select 1 from public.positions where id = p_position_id
  ) then
    raise exception 'Posisi tidak ditemukan'
      using errcode = 'foreign_key_violation';
  end if;

  -- department_id nullable (U01: pengurus inti boleh tanpa departemen)
  if p_department_id is not null and not exists (
    select 1 from public.departments where id = p_department_id
  ) then
    raise exception 'Departemen tidak ditemukan'
      using errcode = 'foreign_key_violation';
  end if;

  resolved_start := coalesce(p_start_date::date, current_date);

  -- Buat member baru berstatus ACTIVE (PRD §9 lifecycle)
  insert into public.members (
    full_name, nim, email, phone, faculty, study_program,
    batch, photo, status, joined_at
  ) values (
    reg.full_name, reg.nim, reg.email, reg.phone,
    reg.faculty, reg.study_program, reg.batch, reg.photo,
    'ACTIVE', resolved_start::timestamptz
  ) returning id into new_member_id;

  -- Buat membership history (D14: tidak pernah dihapus)
  insert into public.membership_histories (
    member_id, organization_period_id, department_id, position_id, start_date
  ) values (
    new_member_id, p_organization_period_id,
    p_department_id, p_position_id, resolved_start
  ) returning id into new_history_id;

  -- Hubungkan registrasi ke member baru
  update public.registrations
    set converted_member_id = new_member_id
    where id = reg.id;

  -- Audit persisten atomik (D13)
  perform private.write_audit(
    auth.uid(),
    'APPLICANT_CONVERTED',
    'registrations',
    reg.id,
    jsonb_build_object('status', reg.status, 'converted_member_id', null),
    jsonb_build_object(
      'converted_member_id', new_member_id,
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

revoke all on function public.admin_convert_registration_to_member(uuid, uuid, uuid, uuid, text)
  from public, anon;
grant execute on function public.admin_convert_registration_to_member(uuid, uuid, uuid, uuid, text)
  to authenticated;
