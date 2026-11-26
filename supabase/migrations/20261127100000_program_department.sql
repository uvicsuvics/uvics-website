-- Pengelola program opsional (D28). Baris lama tetap NULL sampai dikurasi.
alter table public.programs
  add column department_id uuid references public.departments(id) on delete restrict;
create index programs_department_id_idx on public.programs (department_id);

revoke select on public.programs from public, anon, authenticated;
grant select (
  id, name, slug, short_description, description, image, status, display_order, created_at, updated_at
) on public.programs to anon, authenticated;

create function public.read_public_program_departments()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    jsonb_object_agg(p.id::text, jsonb_build_object('slug', d.slug, 'name', d.name)),
    '{}'::jsonb
  )
  from public.programs as p
  join public.departments as d on d.id = p.department_id
  where p.status = 'PUBLISHED' and d.active;
$$;

create function public.read_admin_programs(p_id uuid default null)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  return (
    select coalesce(
      jsonb_agg(to_jsonb(item) order by item.display_order, item.created_at desc, item.id desc),
      '[]'::jsonb
    )
    from (
      select p.id, p.name, p.slug, p.short_description, p.description, p.image,
             p.status, p.display_order, p.created_at, p.updated_at, p.department_id
      from public.programs as p
      where p_id is null or p.id = p_id
      order by p.display_order, p.created_at desc, p.id desc
      limit 100
    ) as item
  );
end;
$$;

revoke all on function public.read_public_program_departments(), public.read_admin_programs(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.read_public_program_departments() to anon, authenticated;
grant execute on function public.read_admin_programs(uuid) to authenticated;

-- Hanya dipanggil sesudah guard admin. Pengiriman ulang FK lama tetap sah setelah penonaktifan.
create function private.program_department_id(p_value jsonb, p_current uuid)
returns uuid
language plpgsql stable security invoker set search_path = ''
as $$
declare
  candidate uuid;
  value_text text := p_value #>> '{}';
begin
  if p_value is null or p_value = 'null'::jsonb then
    return null;
  end if;

  if jsonb_typeof(p_value) <> 'string' or not (
    value_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    or value_text in ('00000000-0000-0000-0000-000000000000', 'ffffffff-ffff-ffff-ffff-ffffffffffff')
  ) then
    raise check_violation using message = 'department_id tidak valid';
  end if;

  candidate := value_text::uuid;
  if candidate is distinct from p_current then
    if not exists (
      select from public.departments where id = candidate and active
    ) then
      raise check_violation using message = 'Departemen tidak tersedia';
    end if;
  end if;
  return candidate;
end;
$$;
revoke all on function private.program_department_id(jsonb, uuid) from public, anon, authenticated, service_role;

create or replace function public.create_program(p_values jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  r public.programs;
  audit_values jsonb;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  insert into public.programs (name, slug, short_description, description, display_order, status, department_id)
  values (
    p_values->>'name', p_values->>'slug', p_values->>'short_description',
    coalesce(p_values->>'description', ''), coalesce((p_values->>'display_order')::integer, 0), 'DRAFT',
    private.program_department_id(p_values->'department_id', null)
  )
  returning * into r;

  audit_values := jsonb_build_object('name', r.name, 'slug', r.slug);
  if r.department_id is not null then
    audit_values := audit_values || jsonb_build_object('changed_fields', jsonb_build_array('department_id'));
  end if;
  perform private.write_audit(auth.uid(), 'PROGRAM_CREATED', 'program', r.id, '{}'::jsonb, audit_values);
  return to_jsonb(r);
end;
$$;

create or replace function public.update_program(p_id uuid, p_changes jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  previous public.programs;
  r public.programs;
  changed text[];
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.programs where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  r := previous;
  r.name := coalesce(p_changes->>'name', previous.name);
  r.slug := coalesce(p_changes->>'slug', previous.slug);
  if p_changes ? 'short_description' then
    r.short_description := p_changes->>'short_description';
  end if;
  if p_changes ? 'description' then
    r.description := coalesce(p_changes->>'description', '');
  end if;
  if p_changes ? 'display_order' then
    r.display_order := (p_changes->>'display_order')::integer;
  end if;
  if p_changes ? 'department_id' then
    r.department_id := private.program_department_id(p_changes->'department_id', previous.department_id);
  end if;

  changed := array_remove(array[
    case when r.department_id is distinct from previous.department_id then 'department_id' end,
    case when r.description is distinct from previous.description then 'description' end,
    case when r.display_order is distinct from previous.display_order then 'display_order' end,
    case when r.name is distinct from previous.name then 'name' end,
    case when r.short_description is distinct from previous.short_description then 'short_description' end,
    case when r.slug is distinct from previous.slug then 'slug' end
  ], null);
  if cardinality(changed) = 0 then
    return to_jsonb(previous);
  end if;

  update public.programs
  set name = r.name, slug = r.slug, short_description = r.short_description,
      description = r.description, display_order = r.display_order, department_id = r.department_id
  where id = p_id
  returning * into r;
  perform private.write_audit(
    auth.uid(), 'PROGRAM_UPDATED', 'program', r.id,
    jsonb_build_object('name', previous.name, 'slug', previous.slug),
    jsonb_build_object('name', r.name, 'slug', r.slug, 'changed_fields', to_jsonb(changed))
  );
  return to_jsonb(r);
end;
$$;
