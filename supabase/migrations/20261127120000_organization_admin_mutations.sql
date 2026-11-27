-- Migration: Audited organization admin mutations (periods, departments, positions, membership histories)
-- Issue: #75 (S3-BE-05)
-- Dependency: #74 (20261127100000_position_levels_and_public_profile.sql)
-- Keputusan yang diterapkan:
--   D07 -> Maksimal satu periode organisasi ACTIVE pada satu waktu.
--   D13 -> Semua mutasi admin melalui fungsi SQL ter-audit dalam satu transaksi.
--   D14 -> Delete guard untuk entitas yang direferensikan histori; histori tidak pernah dihapus.
--   D24 + D29 -> Posisi selain CORE dan ADVISOR wajib memiliki departemen.
-- Kontrak: documents/BACKEND_CONVENTIONS.md, bagian Mutasi admin organisasi #75.

-- ============================================================
-- 1. Private JSONB validation helpers (EXECUTE dicabut dari semua role client)
-- ============================================================
create function private.require_json_object(p_val jsonb)
returns void language plpgsql immutable set search_path = '' as $$
begin
  if p_val is null or jsonb_typeof(p_val) <> 'object' then
    raise exception 'Payload harus berupa JSON object' using errcode = 'check_violation';
  end if;
end;
$$;

create function private.parse_json_text(
  p_obj jsonb,
  p_key text,
  p_required boolean,
  p_max_len integer default null
) returns text language plpgsql immutable set search_path = '' as $$
declare
  v_raw jsonb;
  v_text text;
begin
  if not (p_obj ? p_key) or jsonb_typeof(p_obj->p_key) = 'null' then
    if p_required then
      raise exception 'Field % wajib diisi', p_key using errcode = 'check_violation';
    end if;
    return null;
  end if;

  v_raw := p_obj->p_key;
  if jsonb_typeof(v_raw) <> 'string' then
    raise exception 'Field % harus berupa teks', p_key using errcode = 'check_violation';
  end if;

  v_text := btrim(p_obj->>p_key);
  if p_required and char_length(v_text) = 0 then
    raise exception 'Field % tidak boleh kosong', p_key using errcode = 'check_violation';
  end if;
  if p_max_len is not null and char_length(v_text) > p_max_len then
    raise exception 'Field % melebihi batas panjang %', p_key, p_max_len using errcode = 'check_violation';
  end if;

  return nullif(v_text, '');
end;
$$;

create function private.parse_json_int(
  p_obj jsonb,
  p_key text,
  p_required boolean,
  p_default integer default null
) returns integer language plpgsql immutable set search_path = '' as $$
declare
  v_raw jsonb;
  v_text text;
  v_int integer;
begin
  if not (p_obj ? p_key) then
    if p_required then
      raise exception 'Field % wajib diisi', p_key using errcode = 'check_violation';
    end if;
    return p_default;
  end if;

  v_raw := p_obj->p_key;
  if jsonb_typeof(v_raw) <> 'number' then
    raise exception 'Field % harus berupa bilangan bulat', p_key using errcode = 'check_violation';
  end if;

  v_text := p_obj->>p_key;
  if v_text !~ '^-?[0-9]+$' then
    raise exception 'Field % harus berupa bilangan bulat', p_key using errcode = 'check_violation';
  end if;

  begin
    v_int := v_text::integer;
  exception when numeric_value_out_of_range or invalid_text_representation then
    raise exception 'Field % di luar batas bilangan bulat', p_key using errcode = 'check_violation';
  end;

  return v_int;
end;
$$;

create function private.parse_json_bool(
  p_obj jsonb,
  p_key text,
  p_required boolean,
  p_default boolean default null
) returns boolean language plpgsql immutable set search_path = '' as $$
begin
  if not (p_obj ? p_key) then
    if p_required then
      raise exception 'Field % wajib diisi', p_key using errcode = 'check_violation';
    end if;
    return p_default;
  end if;

  if jsonb_typeof(p_obj->p_key) <> 'boolean' then
    raise exception 'Field % harus berupa boolean', p_key using errcode = 'check_violation';
  end if;

  return (p_obj->>p_key)::boolean;
end;
$$;

create function private.parse_json_date(
  p_obj jsonb,
  p_key text,
  p_required boolean
) returns date language plpgsql immutable set search_path = '' as $$
declare
  v_text text;
  v_date date;
begin
  if not (p_obj ? p_key) or jsonb_typeof(p_obj->p_key) = 'null' then
    if p_required then
      raise exception 'Field % wajib diisi', p_key using errcode = 'check_violation';
    end if;
    return null;
  end if;

  if jsonb_typeof(p_obj->p_key) <> 'string' then
    raise exception 'Field % harus berupa tanggal YYYY-MM-DD', p_key using errcode = 'check_violation';
  end if;

  v_text := p_obj->>p_key;
  if v_text !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    raise exception 'Format % harus YYYY-MM-DD', p_key using errcode = 'check_violation';
  end if;

  begin
    v_date := v_text::date;
  exception when datetime_field_overflow or invalid_datetime_format then
    raise exception 'Tanggal % tidak valid', p_key using errcode = 'check_violation';
  end;

  return v_date;
end;
$$;

create function private.parse_json_uuid(
  p_obj jsonb,
  p_key text,
  p_required boolean
) returns uuid language plpgsql immutable set search_path = '' as $$
declare
  v_uuid uuid;
begin
  if not (p_obj ? p_key) or jsonb_typeof(p_obj->p_key) = 'null' then
    if p_required then
      raise exception 'Field % wajib diisi', p_key using errcode = 'check_violation';
    end if;
    return null;
  end if;

  if jsonb_typeof(p_obj->p_key) <> 'string' then
    raise exception 'Field % harus berupa UUID', p_key using errcode = 'check_violation';
  end if;

  begin
    v_uuid := (p_obj->>p_key)::uuid;
  exception when invalid_text_representation then
    raise exception 'Format UUID % tidak valid', p_key using errcode = 'check_violation';
  end;

  return v_uuid;
end;
$$;

revoke all on function
  private.require_json_object(jsonb),
  private.parse_json_text(jsonb, text, boolean, integer),
  private.parse_json_int(jsonb, text, boolean, integer),
  private.parse_json_bool(jsonb, text, boolean, boolean),
  private.parse_json_date(jsonb, text, boolean),
  private.parse_json_uuid(jsonb, text, boolean)
from public, anon, authenticated, service_role;

-- ============================================================
-- 2. Organization Period RPCs (buat, ubah, aktifkan, akhiri, hapus)
-- ============================================================
create function public.admin_create_organization_period(p_values jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  r public.organization_periods;
  v_name text;
  v_start_date date;
  v_end_date date;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  perform private.require_json_object(p_values);
  v_name := private.parse_json_text(p_values, 'name', true, 120);
  v_start_date := private.parse_json_date(p_values, 'start_date', true);
  v_end_date := private.parse_json_date(p_values, 'end_date', true);

  if v_end_date < v_start_date then
    raise exception 'end_date harus setelah atau sama dengan start_date'
      using errcode = 'check_violation';
  end if;

  -- Periode baru selalu berstatus UPCOMING; aktivasi/pengakhiran lewat RPC khusus.
  insert into public.organization_periods (name, start_date, end_date, status)
  values (v_name, v_start_date, v_end_date, 'UPCOMING')
  returning * into r;

  perform private.write_audit(
    auth.uid(),
    'ORGANIZATION_PERIOD_CREATED',
    'organization_period',
    r.id,
    '{}'::jsonb,
    jsonb_build_object(
      'name', r.name,
      'start_date', r.start_date,
      'end_date', r.end_date,
      'status', r.status
    )
  );

  return to_jsonb(r);
end;
$$;

create function public.admin_update_organization_period(p_id uuid, p_changes jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.organization_periods;
  r public.organization_periods;
  v_changed text[];
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  perform private.require_json_object(p_changes);

  select * into previous from public.organization_periods
    where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  r := previous;
  if p_changes ? 'name' then
    r.name := private.parse_json_text(p_changes, 'name', true, 120);
  end if;
  if p_changes ? 'start_date' then
    r.start_date := private.parse_json_date(p_changes, 'start_date', true);
  end if;
  if p_changes ? 'end_date' then
    r.end_date := private.parse_json_date(p_changes, 'end_date', true);
  end if;

  if r.end_date < r.start_date then
    raise exception 'end_date harus setelah atau sama dengan start_date'
      using errcode = 'check_violation';
  end if;

  if r.start_date is distinct from previous.start_date
    or r.end_date is distinct from previous.end_date then
    if exists (
      select 1 from public.membership_histories mh
      where mh.organization_period_id = p_id
        and (
          (mh.start_date is not null and (mh.start_date < r.start_date or mh.start_date > r.end_date))
          or (mh.end_date is not null and (mh.end_date < r.start_date or mh.end_date > r.end_date))
        )
    ) then
      raise exception 'Rentang tanggal periode harus mencakup seluruh histori keanggotaan yang ada';
    end if;
  end if;

  v_changed := array_remove(array[
    case when r.end_date is distinct from previous.end_date then 'end_date' end,
    case when r.name is distinct from previous.name then 'name' end,
    case when r.start_date is distinct from previous.start_date then 'start_date' end
  ], null);
  if cardinality(v_changed) = 0 then
    return to_jsonb(previous);
  end if;

  update public.organization_periods
  set name = r.name, start_date = r.start_date, end_date = r.end_date
  where id = p_id
  returning * into r;

  perform private.write_audit(
    auth.uid(),
    'ORGANIZATION_PERIOD_UPDATED',
    'organization_period',
    r.id,
    jsonb_build_object(
      'name', previous.name,
      'start_date', previous.start_date,
      'end_date', previous.end_date
    ),
    jsonb_build_object(
      'name', r.name,
      'start_date', r.start_date,
      'end_date', r.end_date,
      'changed_fields', to_jsonb(v_changed)
    )
  );

  return to_jsonb(r);
end;
$$;

create function public.admin_activate_organization_period(p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.organization_periods;
  r public.organization_periods;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.organization_periods
    where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  if previous.status = 'ACTIVE' then
    return to_jsonb(previous);
  end if;

  if previous.status = 'ENDED' then
    raise exception 'Periode organisasi yang sudah berakhir tidak dapat diaktifkan kembali';
  end if;

  -- Kunci baris ACTIVE yang ada (D07); indeks unik single_active_period menjadi pengaman konkuren.
  perform 1 from public.organization_periods
    where status = 'ACTIVE' and id <> p_id
    for update;
  if found then
    raise exception 'Sudah ada periode organisasi yang aktif';
  end if;

  begin
    update public.organization_periods
    set status = 'ACTIVE'
    where id = p_id
    returning * into r;
  exception when unique_violation then
    raise exception 'Sudah ada periode organisasi yang aktif';
  end;

  perform private.write_audit(
    auth.uid(),
    'ORGANIZATION_PERIOD_ACTIVATED',
    'organization_period',
    r.id,
    jsonb_build_object('status', previous.status),
    jsonb_build_object('status', 'ACTIVE')
  );

  return to_jsonb(r);
end;
$$;

create function public.admin_end_organization_period(p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.organization_periods;
  r public.organization_periods;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.organization_periods
    where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  if previous.status = 'ENDED' then
    return to_jsonb(previous);
  end if;

  if previous.status <> 'ACTIVE' then
    raise exception 'Hanya periode organisasi berstatus ACTIVE yang dapat diakhiri';
  end if;

  update public.organization_periods
  set status = 'ENDED'
  where id = p_id
  returning * into r;

  perform private.write_audit(
    auth.uid(),
    'ORGANIZATION_PERIOD_ENDED',
    'organization_period',
    r.id,
    jsonb_build_object('status', previous.status),
    jsonb_build_object('status', 'ENDED')
  );

  return to_jsonb(r);
end;
$$;

create function public.admin_delete_organization_period(p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.organization_periods;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.organization_periods
    where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  if previous.status = 'ACTIVE' then
    raise exception 'Periode organisasi aktif tidak dapat dihapus; akhiri periode terlebih dahulu';
  end if;

  -- Delete guard (D14, PRD §40)
  if exists (
    select 1 from public.membership_histories where organization_period_id = p_id
  ) then
    raise exception 'Periode organisasi masih digunakan oleh histori keanggotaan dan tidak dapat dihapus';
  end if;

  delete from public.organization_periods where id = p_id;

  perform private.write_audit(
    auth.uid(),
    'ORGANIZATION_PERIOD_DELETED',
    'organization_period',
    previous.id,
    jsonb_build_object('name', previous.name, 'status', previous.status),
    '{}'::jsonb
  );

  return jsonb_build_object('id', previous.id, 'deleted', true);
end;
$$;

-- ============================================================
-- 3. Department RPCs (buat, ubah, aktif/nonaktif, display_order, hapus)
-- ============================================================
create function public.admin_create_department(p_values jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  r public.departments;
  v_name text;
  v_slug text;
  v_description text;
  v_display_order integer;
  v_active boolean;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  perform private.require_json_object(p_values);
  v_name := private.parse_json_text(p_values, 'name', true, 120);

  if not (p_values ? 'slug') or jsonb_typeof(p_values->'slug') <> 'string' then
    raise exception 'Field slug wajib berupa teks' using errcode = 'check_violation';
  end if;
  v_slug := p_values->>'slug';

  v_description := private.parse_json_text(p_values, 'description', false, 2000);
  v_display_order := private.parse_json_int(p_values, 'display_order', false, 0);
  v_active := private.parse_json_bool(p_values, 'active', false, true);

  insert into public.departments (name, slug, description, display_order, active)
  values (v_name, v_slug, v_description, v_display_order, v_active)
  returning * into r;

  perform private.write_audit(
    auth.uid(),
    'DEPARTMENT_CREATED',
    'department',
    r.id,
    '{}'::jsonb,
    jsonb_build_object(
      'name', r.name,
      'slug', r.slug,
      'display_order', r.display_order,
      'active', r.active
    )
  );

  return to_jsonb(r);
end;
$$;

create function public.admin_update_department(p_id uuid, p_changes jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.departments;
  r public.departments;
  v_changed text[];
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  perform private.require_json_object(p_changes);

  select * into previous from public.departments
    where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  r := previous;
  if p_changes ? 'name' then
    r.name := private.parse_json_text(p_changes, 'name', true, 120);
  end if;
  if p_changes ? 'slug' then
    if jsonb_typeof(p_changes->'slug') <> 'string' then
      raise exception 'Field slug wajib berupa teks' using errcode = 'check_violation';
    end if;
    r.slug := p_changes->>'slug';
  end if;
  if p_changes ? 'description' then
    r.description := private.parse_json_text(p_changes, 'description', false, 2000);
  end if;
  if p_changes ? 'display_order' then
    r.display_order := private.parse_json_int(p_changes, 'display_order', true, null);
  end if;
  if p_changes ? 'active' then
    r.active := private.parse_json_bool(p_changes, 'active', true, null);
  end if;

  v_changed := array_remove(array[
    case when r.active is distinct from previous.active then 'active' end,
    case when r.description is distinct from previous.description then 'description' end,
    case when r.display_order is distinct from previous.display_order then 'display_order' end,
    case when r.name is distinct from previous.name then 'name' end,
    case when r.slug is distinct from previous.slug then 'slug' end
  ], null);
  if cardinality(v_changed) = 0 then
    return to_jsonb(previous);
  end if;

  update public.departments
  set
    name = r.name,
    slug = r.slug,
    description = r.description,
    display_order = r.display_order,
    active = r.active
  where id = p_id
  returning * into r;

  perform private.write_audit(
    auth.uid(),
    'DEPARTMENT_UPDATED',
    'department',
    r.id,
    jsonb_build_object(
      'name', previous.name,
      'slug', previous.slug,
      'display_order', previous.display_order,
      'active', previous.active
    ),
    jsonb_build_object(
      'name', r.name,
      'slug', r.slug,
      'display_order', r.display_order,
      'active', r.active,
      'changed_fields', to_jsonb(v_changed)
    )
  );

  return to_jsonb(r);
end;
$$;

create function public.admin_delete_department(p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.departments;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.departments
    where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  -- Delete guard (D14, PRD §40): nonaktifkan departemen yang masih direferensikan.
  if exists (
    select 1 from public.membership_histories where department_id = p_id
  ) then
    raise exception 'Departemen masih digunakan oleh histori keanggotaan; nonaktifkan sebagai gantinya';
  end if;
  if exists (
    select 1 from public.registrations where preferred_department_id = p_id
  ) then
    raise exception 'Departemen masih digunakan oleh data pendaftaran; nonaktifkan sebagai gantinya';
  end if;

  delete from public.departments where id = p_id;

  perform private.write_audit(
    auth.uid(),
    'DEPARTMENT_DELETED',
    'department',
    previous.id,
    jsonb_build_object(
      'name', previous.name,
      'slug', previous.slug,
      'active', previous.active
    ),
    '{}'::jsonb
  );

  return jsonb_build_object('id', previous.id, 'deleted', true);
end;
$$;

-- ============================================================
-- 4. Position RPCs (buat, ubah, aktif/nonaktif, display_order, hapus)
-- ============================================================
create function public.admin_create_position(p_values jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  r public.positions;
  v_name text;
  v_description text;
  v_level text;
  v_display_order integer;
  v_active boolean;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  perform private.require_json_object(p_values);
  v_name := private.parse_json_text(p_values, 'name', true, 120);
  v_description := private.parse_json_text(p_values, 'description', false, 2000);

  if not (p_values ? 'level') or jsonb_typeof(p_values->'level') <> 'string' then
    raise exception 'Field level wajib berupa teks kanonis' using errcode = 'check_violation';
  end if;
  v_level := p_values->>'level';

  v_display_order := private.parse_json_int(p_values, 'display_order', false, 0);
  v_active := private.parse_json_bool(p_values, 'active', false, true);

  insert into public.positions (name, description, level, display_order, active)
  values (v_name, v_description, v_level, v_display_order, v_active)
  returning * into r;

  perform private.write_audit(
    auth.uid(),
    'POSITION_CREATED',
    'position',
    r.id,
    '{}'::jsonb,
    jsonb_build_object(
      'name', r.name,
      'level', r.level,
      'display_order', r.display_order,
      'active', r.active
    )
  );

  return to_jsonb(r);
end;
$$;

create function public.admin_update_position(p_id uuid, p_changes jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.positions;
  r public.positions;
  v_changed text[];
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  perform private.require_json_object(p_changes);

  select * into previous from public.positions
    where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  r := previous;
  if p_changes ? 'name' then
    r.name := private.parse_json_text(p_changes, 'name', true, 120);
  end if;
  if p_changes ? 'description' then
    r.description := private.parse_json_text(p_changes, 'description', false, 2000);
  end if;
  if p_changes ? 'level' then
    if jsonb_typeof(p_changes->'level') <> 'string' then
      raise exception 'Field level wajib berupa teks kanonis' using errcode = 'check_violation';
    end if;
    r.level := p_changes->>'level';
  end if;
  if p_changes ? 'display_order' then
    r.display_order := private.parse_json_int(p_changes, 'display_order', true, null);
  end if;
  if p_changes ? 'active' then
    r.active := private.parse_json_bool(p_changes, 'active', true, null);
  end if;

  -- D24 + D29 invariant: jangan ubah CORE/ADVISOR menjadi non-inti jika ada histori tanpa departemen.
  if r.level not in ('CORE', 'ADVISOR') and previous.level in ('CORE', 'ADVISOR') then
    if exists (
      select 1 from public.membership_histories mh
      where mh.position_id = p_id and mh.department_id is null
    ) then
      raise exception 'Level posisi tidak dapat diubah ke non-inti karena masih digunakan histori tanpa departemen';
    end if;
  end if;

  v_changed := array_remove(array[
    case when r.active is distinct from previous.active then 'active' end,
    case when r.description is distinct from previous.description then 'description' end,
    case when r.display_order is distinct from previous.display_order then 'display_order' end,
    case when r.level is distinct from previous.level then 'level' end,
    case when r.name is distinct from previous.name then 'name' end
  ], null);
  if cardinality(v_changed) = 0 then
    return to_jsonb(previous);
  end if;

  update public.positions
  set
    name = r.name,
    description = r.description,
    level = r.level,
    display_order = r.display_order,
    active = r.active
  where id = p_id
  returning * into r;

  perform private.write_audit(
    auth.uid(),
    'POSITION_UPDATED',
    'position',
    r.id,
    jsonb_build_object(
      'name', previous.name,
      'level', previous.level,
      'display_order', previous.display_order,
      'active', previous.active
    ),
    jsonb_build_object(
      'name', r.name,
      'level', r.level,
      'display_order', r.display_order,
      'active', r.active,
      'changed_fields', to_jsonb(v_changed)
    )
  );

  return to_jsonb(r);
end;
$$;

create function public.admin_delete_position(p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.positions;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.positions
    where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  -- Delete guard (D14, PRD §40): nonaktifkan posisi yang masih direferensikan histori.
  if exists (
    select 1 from public.membership_histories where position_id = p_id
  ) then
    raise exception 'Posisi masih digunakan oleh histori keanggotaan; nonaktifkan sebagai gantinya';
  end if;

  delete from public.positions where id = p_id;

  perform private.write_audit(
    auth.uid(),
    'POSITION_DELETED',
    'position',
    previous.id,
    jsonb_build_object(
      'name', previous.name,
      'level', previous.level,
      'active', previous.active
    ),
    '{}'::jsonb
  );

  return jsonb_build_object('id', previous.id, 'deleted', true);
end;
$$;

-- ============================================================
-- 5. Membership History RPCs (tempatkan member, akhiri penempatan; tanpa delete)
-- ============================================================
create function public.admin_assign_membership_history(p_values jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_member_id uuid;
  v_period_id uuid;
  v_department_id uuid;
  v_position_id uuid;
  v_start_date date;
  v_end_date date;
  v_notes text;
  v_member public.members;
  v_period public.organization_periods;
  v_pos public.positions;
  v_dept public.departments;
  r public.membership_histories;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  perform private.require_json_object(p_values);
  v_member_id := private.parse_json_uuid(p_values, 'member_id', true);
  v_period_id := private.parse_json_uuid(p_values, 'organization_period_id', true);
  v_department_id := private.parse_json_uuid(p_values, 'department_id', false);
  v_position_id := private.parse_json_uuid(p_values, 'position_id', true);
  v_start_date := private.parse_json_date(p_values, 'start_date', true);
  v_end_date := private.parse_json_date(p_values, 'end_date', false);
  v_notes := private.parse_json_text(p_values, 'notes', false, 2000);

  if v_end_date is not null and v_end_date < v_start_date then
    raise exception 'end_date harus setelah atau sama dengan start_date'
      using errcode = 'check_violation';
  end if;

  -- Kunci referensi (for key share / for share) agar konsisten terhadap delete/update konkuren.
  select * into v_member from public.members
    where id = v_member_id for key share;
  if not found or v_member.deleted_at is not null then
    raise exception 'Member tidak ditemukan' using errcode = 'no_data_found';
  end if;
  if v_member.status <> 'ACTIVE' then
    raise exception 'Hanya member aktif yang dapat ditempatkan pada periode organisasi';
  end if;

  select * into v_period from public.organization_periods
    where id = v_period_id for share;
  if not found then
    raise exception 'Periode organisasi tidak ditemukan' using errcode = 'no_data_found';
  end if;
  if v_period.status = 'ENDED' then
    raise exception 'Periode organisasi sudah berakhir';
  end if;
  if v_start_date not between v_period.start_date and v_period.end_date then
    raise exception 'Tanggal mulai harus berada dalam periode organisasi';
  end if;
  if v_end_date is not null and v_end_date not between v_period.start_date and v_period.end_date then
    raise exception 'Tanggal selesai harus berada dalam periode organisasi';
  end if;

  select * into v_pos from public.positions
    where id = v_position_id for share;
  if not found then
    raise exception 'Posisi tidak ditemukan' using errcode = 'no_data_found';
  end if;
  if not v_pos.active then
    raise exception 'Posisi tidak aktif';
  end if;

  -- D24 + D29: posisi selain CORE dan ADVISOR wajib memiliki departemen.
  if v_pos.level not in ('CORE', 'ADVISOR') and v_department_id is null then
    raise exception 'Posisi level % wajib memiliki departemen', v_pos.level
      using errcode = 'check_violation';
  end if;

  if v_department_id is not null then
    select * into v_dept from public.departments
      where id = v_department_id for share;
    if not found then
      raise exception 'Departemen tidak ditemukan' using errcode = 'no_data_found';
    end if;
    if not v_dept.active then
      raise exception 'Departemen tidak aktif';
    end if;
  end if;

  insert into public.membership_histories (
    member_id,
    organization_period_id,
    department_id,
    position_id,
    start_date,
    end_date,
    notes
  ) values (
    v_member_id,
    v_period_id,
    v_department_id,
    v_position_id,
    v_start_date,
    v_end_date,
    v_notes
  ) returning * into r;

  perform private.write_audit(
    auth.uid(),
    'MEMBERSHIP_HISTORY_CREATED',
    'membership_history',
    r.id,
    '{}'::jsonb,
    jsonb_build_object(
      'member_id', r.member_id,
      'organization_period_id', r.organization_period_id,
      'department_id', r.department_id,
      'position_id', r.position_id,
      'start_date', r.start_date,
      'end_date', r.end_date
    )
  );

  return to_jsonb(r);
end;
$$;

create function public.admin_end_membership_history(
  p_id uuid,
  p_end_date date,
  p_notes text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.membership_histories;
  v_period public.organization_periods;
  v_new_notes text;
  r public.membership_histories;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  if p_end_date is null then
    raise exception 'Field end_date wajib diisi' using errcode = 'check_violation';
  end if;
  if p_notes is not null and char_length(btrim(p_notes)) > 2000 then
    raise exception 'Catatan penempatan maksimal 2000 karakter' using errcode = 'check_violation';
  end if;

  select * into previous from public.membership_histories
    where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  select * into v_period from public.organization_periods
    where id = previous.organization_period_id for share;

  -- null mempertahankan catatan lama, string kosong menghapusnya
  v_new_notes := case
    when p_notes is null then previous.notes
    else nullif(btrim(p_notes), '')
  end;

  if previous.end_date is not null then
    if p_end_date = previous.end_date and v_new_notes is not distinct from previous.notes then
      return to_jsonb(previous);
    end if;
    raise exception 'Penempatan keanggotaan sudah diakhiri';
  end if;

  if previous.start_date is not null and p_end_date < previous.start_date then
    raise exception 'end_date harus setelah atau sama dengan start_date'
      using errcode = 'check_violation';
  end if;

  if p_end_date < v_period.start_date or p_end_date > v_period.end_date then
    raise exception 'Tanggal selesai harus berada dalam periode organisasi';
  end if;

  update public.membership_histories
  set end_date = p_end_date, notes = v_new_notes
  where id = p_id
  returning * into r;

  perform private.write_audit(
    auth.uid(),
    'MEMBERSHIP_HISTORY_ENDED',
    'membership_history',
    r.id,
    jsonb_build_object('end_date', previous.end_date),
    jsonb_build_object(
      'end_date', r.end_date,
      'notes_changed', v_new_notes is distinct from previous.notes
    )
  );

  return to_jsonb(r);
end;
$$;

-- ============================================================
-- 6. Grants: cabut EXECUTE dari public, anon, service_role; hanya authenticated
-- ============================================================
revoke all on function
  public.admin_create_organization_period(jsonb),
  public.admin_update_organization_period(uuid, jsonb),
  public.admin_activate_organization_period(uuid),
  public.admin_end_organization_period(uuid),
  public.admin_delete_organization_period(uuid),
  public.admin_create_department(jsonb),
  public.admin_update_department(uuid, jsonb),
  public.admin_delete_department(uuid),
  public.admin_create_position(jsonb),
  public.admin_update_position(uuid, jsonb),
  public.admin_delete_position(uuid),
  public.admin_assign_membership_history(jsonb),
  public.admin_end_membership_history(uuid, date, text)
from public, anon, service_role;

grant execute on function
  public.admin_create_organization_period(jsonb),
  public.admin_update_organization_period(uuid, jsonb),
  public.admin_activate_organization_period(uuid),
  public.admin_end_organization_period(uuid),
  public.admin_delete_organization_period(uuid),
  public.admin_create_department(jsonb),
  public.admin_update_department(uuid, jsonb),
  public.admin_delete_department(uuid),
  public.admin_create_position(jsonb),
  public.admin_update_position(uuid, jsonb),
  public.admin_delete_position(uuid),
  public.admin_assign_membership_history(jsonb),
  public.admin_end_membership_history(uuid, date, text)
to authenticated;
