-- Migration: Member soft delete and membership validation
-- Issue: #54 (S3-BE-01)
-- Keputusan yang diterapkan:
--   D13  → Admin hanya membaca tabel organisasi dan membership secara langsung;
--          mutasi dilakukan lewat fungsi SQL ter-audit.
--   D14  → member memakai soft delete (deleted_at); histori keanggotaan restrict.

-- ============================================================
-- 1. RLS: Filter deleted_at pada pembacaan admin di tabel members
-- ============================================================
drop policy if exists active_admin_read on public.members;
create policy active_admin_read on public.members for select to authenticated
  using ((select private.has_active_admin_session()) and deleted_at is null);

-- ============================================================
-- 2. Constraints pada tabel public.members
--    - photo: referensi media, bukan URL, maksimal 500 karakter
--    - linkedin_url, github_url, instagram_url: validasi domain & format HTTP/S lengkap (lebih dari sekadar prefiks '^https?://')
-- ============================================================
alter table public.members
  add constraint members_photo_reference check (
    photo is null or (char_length(photo) <= 500 and photo !~* '^https?://')
  );

alter table public.members drop constraint if exists members_linkedin_url_check;
alter table public.members drop constraint if exists members_github_url_check;
alter table public.members drop constraint if exists members_instagram_url_check;

alter table public.members add constraint members_linkedin_url_check check (
  linkedin_url is null or (
    char_length(linkedin_url) <= 2048 and
    linkedin_url ~ '^https?://((?![Xx][Nn]--)[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}([/?#][!-~]*)?$'
  )
);

alter table public.members add constraint members_github_url_check check (
  github_url is null or (
    char_length(github_url) <= 2048 and
    github_url ~ '^https?://((?![Xx][Nn]--)[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}([/?#][!-~]*)?$'
  )
);

alter table public.members add constraint members_instagram_url_check check (
  instagram_url is null or (
    char_length(instagram_url) <= 2048 and
    instagram_url ~ '^https?://((?![Xx][Nn]--)[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}([/?#][!-~]*)?$'
  )
);

-- ============================================================
-- 3. Constraint pada tabel public.membership_histories
--    - end_date >= start_date (jika keduanya terisi)
-- ============================================================
alter table public.membership_histories
  add constraint membership_histories_date_order check (
    end_date is null or start_date is null or end_date >= start_date
  );

-- ============================================================
-- 4. RPC: public.admin_soft_delete_member
--    Di dalam satu transaksi: cek sesi admin → kunci baris →
--    validasi belum dihapus → set deleted_at → tulis audit
-- ============================================================
create function public.admin_soft_delete_member(
  p_member_id uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  m public.members;
begin
  -- Cek sesi admin aktif (D13, BACKEND_CONVENTIONS §Auth)
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  -- Kunci baris member untuk update
  select * into m from public.members
    where id = p_member_id for update;
  if not found then
    raise no_data_found;
  end if;

  -- Jika sudah di-soft-delete, perlakukan sebagai no_data_found (P0002)
  if m.deleted_at is not null then
    raise exception 'Member tidak ditemukan atau sudah dihapus' using errcode = 'no_data_found';
  end if;

  update public.members set
    deleted_at = statement_timestamp()
  where id = m.id;

  -- Catat audit persisten secara atomik (D13)
  perform private.write_audit(
    auth.uid(),
    'MEMBER_SOFT_DELETED',
    'member',
    m.id,
    jsonb_build_object('status', m.status),
    jsonb_build_object('deleted_at', statement_timestamp())
  );

  return jsonb_build_object('id', m.id, 'deleted', true);
end;
$$;

-- Cabut izin dari public & anon, grant ke authenticated (D13)
revoke all on function public.admin_soft_delete_member(uuid) from public, anon;
grant execute on function public.admin_soft_delete_member(uuid) to authenticated;
