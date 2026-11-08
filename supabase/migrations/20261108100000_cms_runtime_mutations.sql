-- Issue #30: runtime CMS. Mutasi page, program, dan website settings lewat RPC admin
-- yang memeriksa sesi, menulis baris, lalu menulis audit dalam satu transaksi (D13).
-- Kontrak: documents/BACKEND_CONVENTIONS.md, bagian Runtime CMS #30.

create function public.create_page(p_values jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  r public.pages;
  v_title text;
  v_slug text;
  v_content text;
  v_meta_title text;
  v_meta_description text;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  v_title := p_values->>'title';
  v_slug := p_values->>'slug';
  v_content := coalesce(p_values->>'content', '');
  v_meta_title := p_values->>'meta_title';
  v_meta_description := p_values->>'meta_description';

  insert into public.pages (title, slug, content, meta_title, meta_description, status)
  values (v_title, v_slug, v_content, v_meta_title, v_meta_description, 'DRAFT')
  returning * into r;

  perform private.write_audit(
    auth.uid(),
    'PAGE_CREATED',
    'page',
    r.id,
    '{}'::jsonb,
    jsonb_build_object('title', r.title, 'slug', r.slug)
  );

  return to_jsonb(r);
end;
$$;

create function public.update_page(p_id uuid, p_changes jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.pages;
  r public.pages;
  v_changed text[];
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.pages where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  r := previous;
  r.title := coalesce(p_changes->>'title', previous.title);
  r.slug := coalesce(p_changes->>'slug', previous.slug);
  if p_changes ? 'content' then r.content := coalesce(p_changes->>'content', ''); end if;
  if p_changes ? 'meta_title' then r.meta_title := p_changes->>'meta_title'; end if;
  if p_changes ? 'meta_description' then r.meta_description := p_changes->>'meta_description'; end if;

  -- Audit hanya mencatat nama kolom yang berubah (urut abjad), tanpa nilainya.
  v_changed := array_remove(array[
    case when r.content is distinct from previous.content then 'content' end,
    case when r.meta_description is distinct from previous.meta_description then 'meta_description' end,
    case when r.meta_title is distinct from previous.meta_title then 'meta_title' end,
    case when r.slug is distinct from previous.slug then 'slug' end,
    case when r.title is distinct from previous.title then 'title' end
  ], null);
  if cardinality(v_changed) = 0 then
    return to_jsonb(previous);
  end if;

  update public.pages
  set title = r.title, slug = r.slug, content = r.content, meta_title = r.meta_title, meta_description = r.meta_description
  where id = p_id
  returning * into r;

  perform private.write_audit(
    auth.uid(),
    'PAGE_UPDATED',
    'page',
    r.id,
    jsonb_build_object('title', previous.title, 'slug', previous.slug),
    jsonb_build_object('title', r.title, 'slug', r.slug, 'changed_fields', to_jsonb(v_changed))
  );

  return to_jsonb(r);
end;
$$;

create function public.archive_page(p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.pages;
  r public.pages;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.pages where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  if previous.status = 'ARCHIVED' then
    return to_jsonb(previous);
  end if;

  update public.pages set status = 'ARCHIVED' where id = p_id returning * into r;

  perform private.write_audit(
    auth.uid(),
    'PAGE_ARCHIVED',
    'page',
    r.id,
    jsonb_build_object('status', previous.status),
    jsonb_build_object('status', 'ARCHIVED')
  );

  return to_jsonb(r);
end;
$$;

create function public.create_program(p_values jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  r public.programs;
  v_name text;
  v_slug text;
  v_short_desc text;
  v_desc text;
  v_order int;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  v_name := p_values->>'name';
  v_slug := p_values->>'slug';
  v_short_desc := p_values->>'short_description';
  v_desc := coalesce(p_values->>'description', '');
  v_order := coalesce((p_values->>'display_order')::integer, 0);

  -- shortcut: image tidak ditulis dari admin (D44), buka lagi saat jalur publikasi media CMS ada
  insert into public.programs (name, slug, short_description, description, display_order, status)
  values (v_name, v_slug, v_short_desc, v_desc, v_order, 'DRAFT')
  returning * into r;

  perform private.write_audit(
    auth.uid(),
    'PROGRAM_CREATED',
    'program',
    r.id,
    '{}'::jsonb,
    jsonb_build_object('name', r.name, 'slug', r.slug)
  );

  return to_jsonb(r);
end;
$$;

create function public.update_program(p_id uuid, p_changes jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.programs;
  r public.programs;
  v_changed text[];
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.programs where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  -- shortcut: image tidak ditulis dari admin (D44), buka lagi saat jalur publikasi media CMS ada
  r := previous;
  r.name := coalesce(p_changes->>'name', previous.name);
  r.slug := coalesce(p_changes->>'slug', previous.slug);
  if p_changes ? 'short_description' then r.short_description := p_changes->>'short_description'; end if;
  if p_changes ? 'description' then r.description := coalesce(p_changes->>'description', ''); end if;
  if p_changes ? 'display_order' then r.display_order := (p_changes->>'display_order')::integer; end if;

  -- Audit hanya mencatat nama kolom yang berubah (urut abjad), tanpa nilainya.
  v_changed := array_remove(array[
    case when r.description is distinct from previous.description then 'description' end,
    case when r.display_order is distinct from previous.display_order then 'display_order' end,
    case when r.name is distinct from previous.name then 'name' end,
    case when r.short_description is distinct from previous.short_description then 'short_description' end,
    case when r.slug is distinct from previous.slug then 'slug' end
  ], null);
  if cardinality(v_changed) = 0 then
    return to_jsonb(previous);
  end if;

  update public.programs
  set name = r.name, slug = r.slug, short_description = r.short_description, description = r.description, display_order = r.display_order
  where id = p_id
  returning * into r;

  perform private.write_audit(
    auth.uid(),
    'PROGRAM_UPDATED',
    'program',
    r.id,
    jsonb_build_object('name', previous.name, 'slug', previous.slug),
    jsonb_build_object('name', r.name, 'slug', r.slug, 'changed_fields', to_jsonb(v_changed))
  );

  return to_jsonb(r);
end;
$$;

create function public.archive_program(p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.programs;
  r public.programs;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.programs where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  if previous.status = 'ARCHIVED' then
    return to_jsonb(previous);
  end if;

  update public.programs set status = 'ARCHIVED' where id = p_id returning * into r;

  perform private.write_audit(
    auth.uid(),
    'PROGRAM_ARCHIVED',
    'program',
    r.id,
    jsonb_build_object('status', previous.status),
    jsonb_build_object('status', 'ARCHIVED')
  );

  return to_jsonb(r);
end;
$$;

-- Predikat bersama reader publik dan validasi tulis admin, agar nilai yang tersimpan
-- selalu tampil di publik. Ekspresi case disalin apa adanya dari read_public_settings()
-- di 20261008100000_backend_security_guardrails.sql.
create function private.public_setting_is_valid(p_key text, p_value jsonb)
returns boolean language sql immutable set search_path = '' as $$
 select case
  when s.key in('registration_open','maintenance_mode') then jsonb_typeof(s.value)='boolean'
  when jsonb_typeof(s.value)<>'string' then false
  -- Subset konservatif dari DTO: setiap nilai yang lolos di sini juga lolos Zod.
  -- Karakter alfanumerik tidak pernah terpotong trim, jadi teks tidak kosong.
  when s.key in('organization_name','website_title','address','default_meta_title','default_meta_description')
   then char_length(t.v)<=500 and t.v ~ '[[:alnum:]]'
  when s.key='footer_text' then char_length(t.v)<=2000 and t.v ~ '[[:alnum:]]'
  -- Regex email identik dengan Zod 4 (zod/v4/core/regexes.js).
  when s.key='email' then char_length(t.v)<=254
   and t.v ~ '^(?:[A-Za-z0-9_''+-]+\.)*[A-Za-z0-9_''+-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$'
  when s.key='phone' then t.v ~ '^\+[1-9][0-9]{7,14}$'
  -- Host ASCII dengan TLD huruf, tanpa port/credential, path ASCII printable.
  -- Label xn-- (punycode) dikecualikan: WHATWG URL menolak punycode invalid.
  when s.key in('instagram_url','linkedin_url','github_url','youtube_url')
   then char_length(t.v)<=2048
   and t.v ~ '^https?://((?![Xx][Nn]--)[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}([/?#][!-~]*)?$'
  when s.key in('logo','favicon')
   then t.v ~ '^/([A-Za-z0-9_-]+/)*[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp|svg|ico)$'
   or t.v ~ '^https://res\.cloudinary\.com/[a-z0-9_-]+/image/upload/([a-z0-9_,]+/)?v[0-9]+/uvics/published/[a-f0-9-]{36}\.(jpg|png|webp)$'
  else false end
 from (select p_key as key, p_value as value) s
 cross join lateral (select s.value#>>'{}' as v) t;
$$;
revoke all on function private.public_setting_is_valid(text, jsonb) from public, anon, authenticated, service_role;

-- Output, grant, dan security definer tidak berubah; hanya predikatnya dipindah.
create or replace function public.read_public_settings() returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_object_agg(s.key,s.value),'{}') from public.website_settings s
 where private.public_setting_is_valid(s.key, s.value);
$$;

create function public.update_website_settings(p_values jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  k text;
  v jsonb;
  prev_val jsonb;
  r public.website_settings;
  res jsonb := '[]'::jsonb;
  old_payload jsonb;
  new_payload jsonb;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  for k, v in select key, value from jsonb_each(p_values) loop
    if k not in (
      'organization_name', 'website_title', 'logo', 'favicon', 'email', 'phone',
      'address', 'instagram_url', 'linkedin_url', 'github_url', 'youtube_url',
      'footer_text', 'default_meta_title', 'default_meta_description',
      'registration_open', 'maintenance_mode'
    ) then
      raise exception 'invalid setting key' using errcode = 'check_violation';
    end if;

    -- K2: null mengosongkan key teks; identitas wajib dan flag boolean tidak boleh kosong.
    if jsonb_typeof(v) = 'null' then
      if k in ('organization_name', 'website_title', 'registration_open', 'maintenance_mode') then
        raise exception 'setting value required' using errcode = 'check_violation';
      end if;
    elsif private.public_setting_is_valid(k, v) is not true then
      raise exception 'invalid setting value' using errcode = 'check_violation';
    end if;

    select value into prev_val from public.website_settings where key = k for update;

    insert into public.website_settings (key, value, updated_at, updated_by)
    values (k, v, statement_timestamp(), auth.uid())
    on conflict (key) do update set
      value = excluded.value,
      updated_at = statement_timestamp(),
      updated_by = auth.uid()
    returning * into r;

    res := res || jsonb_build_array(to_jsonb(r));

    if k in ('registration_open', 'maintenance_mode') then
      old_payload := jsonb_build_object('key', k, 'value', prev_val);
      new_payload := jsonb_build_object('key', k, 'value', v);
    else
      old_payload := jsonb_build_object('key', k);
      new_payload := jsonb_build_object('key', k);
    end if;

    perform private.write_audit(
      auth.uid(),
      'SETTING_UPDATED',
      'website_settings',
      null,
      old_payload,
      new_payload
    );
  end loop;

  return res;
end;
$$;

revoke all on function public.create_page(jsonb),
  public.update_page(uuid, jsonb),
  public.archive_page(uuid),
  public.create_program(jsonb),
  public.update_program(uuid, jsonb),
  public.archive_program(uuid),
  public.update_website_settings(jsonb) from public, anon, service_role;

grant execute on function public.create_page(jsonb),
  public.update_page(uuid, jsonb),
  public.archive_page(uuid),
  public.create_program(jsonb),
  public.update_program(uuid, jsonb),
  public.archive_program(uuid),
  public.update_website_settings(jsonb) to authenticated;
