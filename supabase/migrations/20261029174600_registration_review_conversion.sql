-- Migration: Registration review & member conversion workflow
-- Issue: #29 (S2-BE-02)
-- Keputusan yang diterapkan:
--   D12  → Hanya ACCEPTED yang boleh dikonversi; 1 registration = max 1 member
--   D13  → Mutasi lewat fungsi SQL ter-audit, bukan UPDATE langsung
--   D14  → membership_histories ON DELETE RESTRICT; member soft delete
--   U01  → department_id nullable (core team tanpa departemen; masih Usulan)
-- Error: guard bisnis P0001 (CONFLICT), referensi tidak ditemukan P0002 (NOT_FOUND).
-- Referensi: PRD §23, §24, §65; BACKEND_CONVENTIONS.md §Kontrak review registrasi #29

-- ============================================================
-- 1. U01: core team (President, Treasurer, Secretary) tidak berada
--    di departemen manapun. Lihat: DECISIONS.md U01, PRD §13
-- ============================================================
alter table public.membership_histories
  alter column department_id drop not null;

-- Sama dengan batas Zod reviewRegistrationInputSchema.
alter table public.registrations
  add constraint registrations_admin_notes_length check (char_length(admin_notes) <= 2000);

-- ============================================================
-- 2. RPC: Admin review registration (ubah status & catatan)
--    Di dalam satu transaksi: cek sesi → kunci → validasi transisi → UPDATE → audit
-- ============================================================
create function public.admin_review_registration(
  p_registration_id uuid,
  p_status text,
  p_admin_notes text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  reg public.registrations;
  new_notes text;
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

  -- Registrasi yang sudah dikonversi tidak boleh diubah (D12)
  if reg.converted_member_id is not null then
    raise exception 'Registrasi yang sudah dikonversi tidak dapat diubah';
  end if;

  -- Transisi issue #29: SUBMITTED → UNDER_REVIEW → ACCEPTED | REJECTED.
  -- Status yang sama hanya memperbarui catatan.
  if p_status is null or (p_status <> reg.status and (reg.status, p_status) not in (
    ('SUBMITTED', 'UNDER_REVIEW'), ('UNDER_REVIEW', 'ACCEPTED'), ('UNDER_REVIEW', 'REJECTED')
  )) then
    raise exception 'Transisi status % ke % tidak diizinkan', reg.status, p_status;
  end if;

  -- null mempertahankan catatan, string kosong menghapusnya
  new_notes := case when p_admin_notes is null then reg.admin_notes else nullif(p_admin_notes, '') end;
  if p_status = reg.status and new_notes is not distinct from reg.admin_notes then
    return jsonb_build_object('id', reg.id, 'status', reg.status);
  end if;

  update public.registrations set
    status       = p_status,
    admin_notes  = new_notes,
    accepted_at  = case when p_status = reg.status then reg.accepted_at
                        when p_status = 'ACCEPTED' then statement_timestamp() end,
    rejected_at  = case when p_status = reg.status then reg.rejected_at
                        when p_status = 'REJECTED' then statement_timestamp() end
  where id = reg.id;

  -- Catat audit persisten (D13, BACKEND_CONVENTIONS.md §Auth/audit)
  perform private.write_audit(
    auth.uid(),
    'REGISTRATION_REVIEWED',
    'registration',
    reg.id,
    jsonb_build_object('status', reg.status),
    jsonb_build_object('status', p_status, 'notes_changed', new_notes is distinct from reg.admin_notes)
  );

  return jsonb_build_object('id', reg.id, 'status', p_status);
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
--      → ensure not converted → validasi penempatan → create member ACTIVE
--      → create membership_history → set converted_member_id
--      → write audit → commit
-- ============================================================
create function public.admin_convert_registration_to_member(
  p_registration_id uuid,
  p_organization_period_id uuid,
  p_position_id uuid,
  p_start_date date,
  p_department_id uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  reg public.registrations;
  period public.organization_periods;
  is_active boolean;
  new_member_id uuid;
  new_history_id uuid;
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
    raise exception 'Hanya pendaftar berstatus ACCEPTED yang dapat dikonversi';
  end if;

  -- Cegah konversi ganda (D12, scope 6)
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

  select active into is_active from public.positions where id = p_position_id;
  if not found then
    raise exception 'Posisi tidak ditemukan' using errcode = 'no_data_found';
  end if;
  if not is_active then
    raise exception 'Posisi tidak aktif';
  end if;

  -- shortcut: department_id null diizinkan untuk posisi apa pun; aturan "posisi non-inti wajib
  -- departemen" menunggu keputusan U01/U08 karena positions.level masih teks bebas.
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

  -- Buat member baru berstatus ACTIVE (PRD §9 lifecycle)
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
  from public, anon;
grant execute on function public.admin_convert_registration_to_member(uuid, uuid, uuid, date, uuid)
  to authenticated;
