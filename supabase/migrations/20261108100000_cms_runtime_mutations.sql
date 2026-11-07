-- Issue #30: Mutasi CMS ter-audit atomik dalam satu transaksi SQL.
-- Menggantikan RPC generik log_cms_audit dengan fungsi domain khusus admin.

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
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.pages where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  update public.pages
  set
    title = coalesce(p_changes->>'title', previous.title),
    slug = coalesce(p_changes->>'slug', previous.slug),
    content = case when p_changes ? 'content' then coalesce(p_changes->>'content', '') else previous.content end,
    meta_title = case when p_changes ? 'meta_title' then p_changes->>'meta_title' else previous.meta_title end,
    meta_description = case when p_changes ? 'meta_description' then p_changes->>'meta_description' else previous.meta_description end
  where id = p_id
  returning * into r;

  perform private.write_audit(
    auth.uid(),
    'PAGE_UPDATED',
    'page',
    r.id,
    jsonb_build_object('title', previous.title, 'slug', previous.slug),
    jsonb_build_object('title', r.title, 'slug', r.slug)
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
  v_image text;
  v_order int;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  v_name := p_values->>'name';
  v_slug := p_values->>'slug';
  v_short_desc := p_values->>'short_description';
  v_desc := coalesce(p_values->>'description', '');
  v_image := p_values->>'image';
  v_order := coalesce((p_values->>'display_order')::integer, 0);

  insert into public.programs (name, slug, short_description, description, image, display_order, status)
  values (v_name, v_slug, v_short_desc, v_desc, v_image, v_order, 'DRAFT')
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
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.programs where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  update public.programs
  set
    name = coalesce(p_changes->>'name', previous.name),
    slug = coalesce(p_changes->>'slug', previous.slug),
    short_description = case when p_changes ? 'short_description' then p_changes->>'short_description' else previous.short_description end,
    description = case when p_changes ? 'description' then coalesce(p_changes->>'description', '') else previous.description end,
    image = case when p_changes ? 'image' then p_changes->>'image' else previous.image end,
    display_order = case when p_changes ? 'display_order' then (p_changes->>'display_order')::integer else previous.display_order end
  where id = p_id
  returning * into r;

  perform private.write_audit(
    auth.uid(),
    'PROGRAM_UPDATED',
    'program',
    r.id,
    jsonb_build_object('name', previous.name, 'slug', previous.slug),
    jsonb_build_object('name', r.name, 'slug', r.slug)
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
      raise exception 'invalid setting key';
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
  public.update_website_settings(jsonb) from public, anon;

grant execute on function public.create_page(jsonb),
  public.update_page(uuid, jsonb),
  public.archive_page(uuid),
  public.create_program(jsonb),
  public.update_program(uuid, jsonb),
  public.archive_program(uuid),
  public.update_website_settings(jsonb) to authenticated;
