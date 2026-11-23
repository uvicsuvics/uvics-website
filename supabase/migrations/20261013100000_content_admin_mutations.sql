-- Issue #55 ([S3-BE-02]): Audited Admin Mutations for Competitions, Achievements and Projects.
-- Mengikuti D13: mutasi konten melalui RPC atomik dengan pencatatan audit.
-- Menutup risiko D21: membatasi select member_id untuk authenticated non-admin lewat column grants dan admin views.

-- 1. Helper validasi dan pengikatan referensi media pada upload_intents (status COMPLETED & cleanup_status HELD)
create function private.validate_content_media(
  p_ref text,
  p_expected_kind text,
  p_allowed_categories text[],
  p_reference_type text,
  p_reference_id uuid
)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_intent private.upload_intents;
begin
  if p_ref is null or btrim(p_ref) = '' then
    return null;
  end if;

  begin
    v_id := p_ref::uuid;
  exception when invalid_text_representation then
    raise exception 'Invalid media reference: %', p_ref using errcode = '22023';
  end;

  select * into v_intent from private.upload_intents
  where id = v_id
    and status = 'COMPLETED'
    and cleanup_status = 'HELD'
    and (p_expected_kind is null or kind = p_expected_kind)
    and category = any(p_allowed_categories)
  for update;

  if not found then
    raise exception 'Invalid media reference: %', p_ref using errcode = '22023';
  end if;

  if v_intent.reference_id is not null and (
    v_intent.reference_id <> p_reference_id
    or v_intent.reference_type is distinct from p_reference_type
  ) then
    raise exception 'Media reference already bound: %', p_ref using errcode = '22023';
  end if;

  if v_intent.reference_id is distinct from p_reference_id
     or v_intent.reference_type is distinct from p_reference_type then
    update private.upload_intents
    set reference_type = p_reference_type,
        reference_id = p_reference_id
    where id = v_id;
  end if;

  return v_id::text;
end;
$$;
revoke all on function private.validate_content_media(text, text, text[], text, uuid) from public, anon, authenticated, service_role;

-- 2. D21: Tutup celah eksposur member_id ke authenticated non-admin.
revoke select on public.achievement_members, public.project_members from authenticated;
grant select (id, achievement_id, member_name, role, created_at) on public.achievement_members to authenticated;
grant select (id, project_id, member_name, role, created_at) on public.project_members to authenticated;

create view public.admin_achievement_members with (security_invoker = false, security_barrier = true) as
  select * from public.achievement_members
  where (select private.has_active_admin_session());

create view public.admin_project_members with (security_invoker = false, security_barrier = true) as
  select * from public.project_members
  where (select private.has_active_admin_session());

revoke all on public.admin_achievement_members, public.admin_project_members
  from public, anon, authenticated, service_role;
grant select on public.admin_achievement_members, public.admin_project_members to authenticated;

-- 3. Competitions RPC mutations
create function public.create_competition(p_values jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  r public.competitions;
  v_id uuid := gen_random_uuid();
  v_title text;
  v_slug text;
  v_organizer text;
  v_description text;
  v_category text;
  v_level public.content_level;
  v_reg_deadline date;
  v_comp_date date;
  v_reg_url text;
  v_guide_url text;
  v_poster text;
  v_team_size text;
  v_eligibility text;
  v_status public.competition_status;
  v_featured boolean;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  v_title := p_values->>'title';
  v_slug := p_values->>'slug';
  v_organizer := p_values->>'organizer';
  v_description := coalesce(p_values->>'description', '');
  v_category := p_values->>'category';
  v_level := (p_values->>'level')::public.content_level;
  v_reg_deadline := (p_values->>'registration_deadline')::date;
  v_comp_date := (p_values->>'competition_date')::date;
  v_reg_url := p_values->>'registration_url';
  v_guide_url := p_values->>'guidebook_url';
  v_poster := private.validate_content_media(
    p_values->>'poster',
    'image',
    array['poster', 'thumbnail', 'gallery'],
    'competition',
    v_id
  );
  v_team_size := p_values->>'team_size';
  v_eligibility := p_values->>'eligibility';
  v_status := coalesce((p_values->>'status')::public.competition_status, 'UPCOMING');
  v_featured := coalesce((p_values->>'featured')::boolean, false);

  insert into public.competitions (
    id, title, slug, organizer, description, category, level,
    registration_deadline, competition_date, registration_url, guidebook_url,
    poster, team_size, eligibility, status, publication_status, featured
  ) values (
    v_id, v_title, v_slug, v_organizer, v_description, v_category, v_level,
    v_reg_deadline, v_comp_date, v_reg_url, v_guide_url,
    v_poster, v_team_size, v_eligibility, v_status, 'DRAFT', v_featured
  ) returning * into r;

  perform private.write_audit(
    auth.uid(),
    'COMPETITION_CREATED',
    'competition',
    r.id,
    '{}'::jsonb,
    jsonb_build_object(
      'title', r.title,
      'slug', r.slug,
      'registration_url', r.registration_url,
      'guidebook_url', r.guidebook_url
    )
  );

  return to_jsonb(r);
end;
$$;

create function public.update_competition(p_id uuid, p_changes jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.competitions;
  r public.competitions;
  v_poster text;
  v_changed jsonb;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.competitions where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  if p_changes ? 'poster' then
    v_poster := private.validate_content_media(
      p_changes->>'poster',
      'image',
      array['poster', 'thumbnail', 'gallery'],
      'competition',
      p_id
    );
  else
    v_poster := previous.poster;
  end if;

  update public.competitions
  set
    title = coalesce(p_changes->>'title', previous.title),
    slug = coalesce(p_changes->>'slug', previous.slug),
    organizer = coalesce(p_changes->>'organizer', previous.organizer),
    description = case when p_changes ? 'description' then coalesce(p_changes->>'description', '') else previous.description end,
    category = case when p_changes ? 'category' then p_changes->>'category' else previous.category end,
    level = case when p_changes ? 'level' then (p_changes->>'level')::public.content_level else previous.level end,
    registration_deadline = case when p_changes ? 'registration_deadline' then (p_changes->>'registration_deadline')::date else previous.registration_deadline end,
    competition_date = case when p_changes ? 'competition_date' then (p_changes->>'competition_date')::date else previous.competition_date end,
    registration_url = case when p_changes ? 'registration_url' then p_changes->>'registration_url' else previous.registration_url end,
    guidebook_url = case when p_changes ? 'guidebook_url' then p_changes->>'guidebook_url' else previous.guidebook_url end,
    poster = v_poster,
    team_size = case when p_changes ? 'team_size' then p_changes->>'team_size' else previous.team_size end,
    eligibility = case when p_changes ? 'eligibility' then p_changes->>'eligibility' else previous.eligibility end,
    status = case when p_changes ? 'status' then (p_changes->>'status')::public.competition_status else previous.status end,
    featured = case when p_changes ? 'featured' then (p_changes->>'featured')::boolean else previous.featured end
  where id = p_id
  returning * into r;

  v_changed := to_jsonb(array_remove(array[
    case when r.category is distinct from previous.category then 'category' end,
    case when r.competition_date is distinct from previous.competition_date then 'competition_date' end,
    case when r.description is distinct from previous.description then 'description' end,
    case when r.eligibility is distinct from previous.eligibility then 'eligibility' end,
    case when r.featured is distinct from previous.featured then 'featured' end,
    case when r.guidebook_url is distinct from previous.guidebook_url then 'guidebook_url' end,
    case when r.level is distinct from previous.level then 'level' end,
    case when r.organizer is distinct from previous.organizer then 'organizer' end,
    case when r.poster is distinct from previous.poster then 'poster' end,
    case when r.registration_deadline is distinct from previous.registration_deadline then 'registration_deadline' end,
    case when r.registration_url is distinct from previous.registration_url then 'registration_url' end,
    case when r.slug is distinct from previous.slug then 'slug' end,
    case when r.status is distinct from previous.status then 'status' end,
    case when r.team_size is distinct from previous.team_size then 'team_size' end,
    case when r.title is distinct from previous.title then 'title' end
  ], null));

  perform private.write_audit(
    auth.uid(),
    'COMPETITION_UPDATED',
    'competition',
    p_id,
    jsonb_build_object(
      'title', previous.title,
      'slug', previous.slug,
      'registration_url', previous.registration_url,
      'guidebook_url', previous.guidebook_url
    ),
    jsonb_build_object(
      'title', r.title,
      'slug', r.slug,
      'registration_url', r.registration_url,
      'guidebook_url', r.guidebook_url,
      'changed', v_changed
    )
  );

  return to_jsonb(r);
end;
$$;

create function public.publish_competition(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  previous public.content_status;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select publication_status into previous from public.competitions where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  if previous = 'PUBLISHED' then
    return;
  end if;

  update public.competitions set publication_status = 'PUBLISHED' where id = p_id;

  perform private.write_audit(
    auth.uid(),
    'COMPETITION_PUBLISHED',
    'competition',
    p_id,
    jsonb_build_object('publication_status', previous),
    jsonb_build_object('publication_status', 'PUBLISHED')
  );
end;
$$;

create function public.delete_competition(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  previous public.competitions;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.competitions where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  delete from public.competitions where id = p_id;

  perform private.write_audit(
    auth.uid(),
    'COMPETITION_DELETED',
    'competition',
    p_id,
    jsonb_build_object('title', previous.title, 'slug', previous.slug),
    '{}'::jsonb
  );
end;
$$;

-- 4. Achievements RPC mutations & admin query
create function public.create_achievement(p_values jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  r public.achievements;
  v_id uuid := gen_random_uuid();
  v_title text;
  v_slug text;
  v_comp_name text;
  v_organizer text;
  v_level public.content_level;
  v_ranking text;
  v_date date;
  v_description text;
  v_cover text;
  v_cert text;
  v_member jsonb;
  v_m_id uuid;
  v_m_name text;
  v_m_role text;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  v_title := p_values->>'title';
  v_slug := p_values->>'slug';
  v_comp_name := p_values->>'competition_name';
  v_organizer := p_values->>'organizer';
  v_level := (p_values->>'level')::public.content_level;
  v_ranking := p_values->>'ranking';
  v_date := (p_values->>'achievement_date')::date;
  v_description := coalesce(p_values->>'description', '');
  v_cover := private.validate_content_media(
    p_values->>'cover_image',
    'image',
    array['poster', 'thumbnail', 'gallery'],
    'achievement',
    v_id
  );

  insert into public.achievements (
    id, title, slug, competition_name, organizer, level, ranking, achievement_date, description, cover_image, publication_status
  ) values (
    v_id, v_title, v_slug, v_comp_name, v_organizer, v_level, v_ranking, v_date, v_description, v_cover, 'DRAFT'
  ) returning * into r;

  if p_values ? 'certificate_file' and p_values->>'certificate_file' is not null and btrim(p_values->>'certificate_file') <> '' then
    v_cert := private.validate_content_media(
      p_values->>'certificate_file',
      null,
      array['certificate'],
      'achievement_certificate',
      r.id
    );
    insert into public.achievement_certificates (achievement_id, certificate_file)
    values (r.id, v_cert);
  end if;

  if p_values ? 'members' and jsonb_typeof(p_values->'members') = 'array' then
    for v_member in select * from jsonb_array_elements(p_values->'members') loop
      v_m_id := (v_member->>'member_id')::uuid;
      v_m_name := v_member->>'member_name';
      v_m_role := v_member->>'role';
      if v_m_id is null and (v_m_name is null or btrim(v_m_name) = '') then
        raise exception 'Member row must have either member_id or member_name' using errcode = '22023';
      end if;
      insert into public.achievement_members (achievement_id, member_id, member_name, role)
      values (r.id, v_m_id, v_m_name, v_m_role);
    end loop;
  end if;

  perform private.write_audit(
    auth.uid(),
    'ACHIEVEMENT_CREATED',
    'achievement',
    r.id,
    '{}'::jsonb,
    jsonb_build_object('title', r.title, 'slug', r.slug)
  );

  return to_jsonb(r);
end;
$$;

create function public.update_achievement(p_id uuid, p_changes jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.achievements;
  r public.achievements;
  v_cover text;
  v_prev_cert text;
  v_new_cert text;
  v_member jsonb;
  v_m_id uuid;
  v_m_name text;
  v_m_role text;
  v_changed jsonb;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.achievements where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  select certificate_file into v_prev_cert from public.achievement_certificates where achievement_id = p_id;
  v_new_cert := v_prev_cert;

  if p_changes ? 'cover_image' then
    v_cover := private.validate_content_media(
      p_changes->>'cover_image',
      'image',
      array['poster', 'thumbnail', 'gallery'],
      'achievement',
      p_id
    );
  else
    v_cover := previous.cover_image;
  end if;

  update public.achievements
  set
    title = coalesce(p_changes->>'title', previous.title),
    slug = coalesce(p_changes->>'slug', previous.slug),
    competition_name = coalesce(p_changes->>'competition_name', previous.competition_name),
    organizer = case when p_changes ? 'organizer' then p_changes->>'organizer' else previous.organizer end,
    level = case when p_changes ? 'level' then (p_changes->>'level')::public.content_level else previous.level end,
    ranking = coalesce(p_changes->>'ranking', previous.ranking),
    achievement_date = case when p_changes ? 'achievement_date' then (p_changes->>'achievement_date')::date else previous.achievement_date end,
    description = case when p_changes ? 'description' then coalesce(p_changes->>'description', '') else previous.description end,
    cover_image = v_cover
  where id = p_id
  returning * into r;

  if p_changes ? 'certificate_file' then
    if p_changes->>'certificate_file' is null or btrim(p_changes->>'certificate_file') = '' then
      delete from public.achievement_certificates where achievement_id = p_id;
      v_new_cert := null;
    else
      v_new_cert := private.validate_content_media(
        p_changes->>'certificate_file',
        null,
        array['certificate'],
        'achievement_certificate',
        p_id
      );
      insert into public.achievement_certificates (achievement_id, certificate_file)
      values (p_id, v_new_cert)
      on conflict (achievement_id) do update set certificate_file = excluded.certificate_file;
    end if;
  end if;

  if p_changes ? 'members' and jsonb_typeof(p_changes->'members') = 'array' then
    delete from public.achievement_members where achievement_id = p_id;
    for v_member in select * from jsonb_array_elements(p_changes->'members') loop
      v_m_id := (v_member->>'member_id')::uuid;
      v_m_name := v_member->>'member_name';
      v_m_role := v_member->>'role';
      if v_m_id is null and (v_m_name is null or btrim(v_m_name) = '') then
        raise exception 'Member row must have either member_id or member_name' using errcode = '22023';
      end if;
      insert into public.achievement_members (achievement_id, member_id, member_name, role)
      values (p_id, v_m_id, v_m_name, v_m_role);
    end loop;
  end if;

  -- Jangan masukkan nama/PII member ke payload audit; hanya nama kolom yang berubah.
  v_changed := to_jsonb(array_remove(array[
    case when r.achievement_date is distinct from previous.achievement_date then 'achievement_date' end,
    case when v_new_cert is distinct from v_prev_cert then 'certificate_file' end,
    case when r.competition_name is distinct from previous.competition_name then 'competition_name' end,
    case when r.cover_image is distinct from previous.cover_image then 'cover_image' end,
    case when r.description is distinct from previous.description then 'description' end,
    case when r.level is distinct from previous.level then 'level' end,
    case when p_changes ? 'members' and jsonb_typeof(p_changes->'members') = 'array' then 'members' end,
    case when r.organizer is distinct from previous.organizer then 'organizer' end,
    case when r.ranking is distinct from previous.ranking then 'ranking' end,
    case when r.slug is distinct from previous.slug then 'slug' end,
    case when r.title is distinct from previous.title then 'title' end
  ], null));

  perform private.write_audit(
    auth.uid(),
    'ACHIEVEMENT_UPDATED',
    'achievement',
    p_id,
    jsonb_build_object('title', previous.title, 'slug', previous.slug),
    jsonb_build_object('title', r.title, 'slug', r.slug, 'changed', v_changed)
  );

  return to_jsonb(r);
end;
$$;

create function public.publish_achievement(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  previous public.content_status;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select publication_status into previous from public.achievements where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  if previous = 'PUBLISHED' then
    return;
  end if;

  update public.achievements set publication_status = 'PUBLISHED' where id = p_id;

  perform private.write_audit(
    auth.uid(),
    'ACHIEVEMENT_PUBLISHED',
    'achievement',
    p_id,
    jsonb_build_object('publication_status', previous),
    jsonb_build_object('publication_status', 'PUBLISHED')
  );
end;
$$;

create function public.delete_achievement(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  previous public.achievements;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.achievements where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  delete from public.achievements where id = p_id;

  perform private.write_audit(
    auth.uid(),
    'ACHIEVEMENT_DELETED',
    'achievement',
    p_id,
    jsonb_build_object('title', previous.title, 'slug', previous.slug),
    '{}'::jsonb
  );
end;
$$;

create function public.get_admin_achievement(p_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_ach public.achievements;
  v_cert text;
  v_members jsonb;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into v_ach from public.achievements where id = p_id;
  if not found then
    raise no_data_found;
  end if;

  select certificate_file into v_cert from public.achievement_certificates where achievement_id = p_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', am.id,
    'member_id', am.member_id,
    'member_name', am.member_name,
    'role', am.role,
    'created_at', am.created_at
  ) order by am.created_at, am.id), '[]'::jsonb)
  into v_members
  from public.achievement_members am
  where am.achievement_id = p_id;

  return jsonb_build_object(
    'id', v_ach.id,
    'title', v_ach.title,
    'slug', v_ach.slug,
    'competition_name', v_ach.competition_name,
    'organizer', v_ach.organizer,
    'level', v_ach.level,
    'ranking', v_ach.ranking,
    'achievement_date', v_ach.achievement_date,
    'description', v_ach.description,
    'cover_image', v_ach.cover_image,
    'publication_status', v_ach.publication_status,
    'certificate_file', v_cert,
    'members', v_members,
    'created_at', v_ach.created_at,
    'updated_at', v_ach.updated_at
  );
end;
$$;

-- 5. Projects RPC mutations & admin query
create function public.create_project(p_values jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  r public.projects;
  v_id uuid := gen_random_uuid();
  v_title text;
  v_slug text;
  v_summary text;
  v_description text;
  v_cover text;
  v_proj_url text;
  v_repo_url text;
  v_start_date date;
  v_end_date date;
  v_status public.project_status;
  v_featured boolean;
  v_member jsonb;
  v_m_id uuid;
  v_m_name text;
  v_m_role text;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  v_title := p_values->>'title';
  v_slug := p_values->>'slug';
  v_summary := p_values->>'summary';
  v_description := coalesce(p_values->>'description', '');
  v_cover := private.validate_content_media(
    p_values->>'cover_image',
    'image',
    array['poster', 'thumbnail', 'gallery'],
    'project',
    v_id
  );
  v_proj_url := p_values->>'project_url';
  v_repo_url := p_values->>'repository_url';
  v_start_date := (p_values->>'start_date')::date;
  v_end_date := (p_values->>'end_date')::date;
  v_status := coalesce((p_values->>'status')::public.project_status, 'PLANNED');
  v_featured := coalesce((p_values->>'featured')::boolean, false);

  insert into public.projects (
    id, title, slug, summary, description, cover_image, project_url, repository_url, start_date, end_date, status, publication_status, featured
  ) values (
    v_id, v_title, v_slug, v_summary, v_description, v_cover, v_proj_url, v_repo_url, v_start_date, v_end_date, v_status, 'DRAFT', v_featured
  ) returning * into r;

  if p_values ? 'members' and jsonb_typeof(p_values->'members') = 'array' then
    for v_member in select * from jsonb_array_elements(p_values->'members') loop
      v_m_id := (v_member->>'member_id')::uuid;
      v_m_name := v_member->>'member_name';
      v_m_role := v_member->>'role';
      if v_m_id is null and (v_m_name is null or btrim(v_m_name) = '') then
        raise exception 'Member row must have either member_id or member_name' using errcode = '22023';
      end if;
      insert into public.project_members (project_id, member_id, member_name, role)
      values (r.id, v_m_id, v_m_name, v_m_role);
    end loop;
  end if;

  perform private.write_audit(
    auth.uid(),
    'PROJECT_CREATED',
    'project',
    r.id,
    '{}'::jsonb,
    jsonb_build_object(
      'title', r.title,
      'slug', r.slug,
      'project_url', r.project_url,
      'repository_url', r.repository_url
    )
  );

  return to_jsonb(r);
end;
$$;

create function public.update_project(p_id uuid, p_changes jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.projects;
  r public.projects;
  v_cover text;
  v_member jsonb;
  v_m_id uuid;
  v_m_name text;
  v_m_role text;
  v_changed jsonb;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.projects where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  if p_changes ? 'cover_image' then
    v_cover := private.validate_content_media(
      p_changes->>'cover_image',
      'image',
      array['poster', 'thumbnail', 'gallery'],
      'project',
      p_id
    );
  else
    v_cover := previous.cover_image;
  end if;

  update public.projects
  set
    title = coalesce(p_changes->>'title', previous.title),
    slug = coalesce(p_changes->>'slug', previous.slug),
    summary = coalesce(p_changes->>'summary', previous.summary),
    description = case when p_changes ? 'description' then coalesce(p_changes->>'description', '') else previous.description end,
    cover_image = v_cover,
    project_url = case when p_changes ? 'project_url' then p_changes->>'project_url' else previous.project_url end,
    repository_url = case when p_changes ? 'repository_url' then p_changes->>'repository_url' else previous.repository_url end,
    start_date = case when p_changes ? 'start_date' then (p_changes->>'start_date')::date else previous.start_date end,
    end_date = case when p_changes ? 'end_date' then (p_changes->>'end_date')::date else previous.end_date end,
    status = case when p_changes ? 'status' then (p_changes->>'status')::public.project_status else previous.status end,
    featured = case when p_changes ? 'featured' then (p_changes->>'featured')::boolean else previous.featured end
  where id = p_id
  returning * into r;

  if p_changes ? 'members' and jsonb_typeof(p_changes->'members') = 'array' then
    delete from public.project_members where project_id = p_id;
    for v_member in select * from jsonb_array_elements(p_changes->'members') loop
      v_m_id := (v_member->>'member_id')::uuid;
      v_m_name := v_member->>'member_name';
      v_m_role := v_member->>'role';
      if v_m_id is null and (v_m_name is null or btrim(v_m_name) = '') then
        raise exception 'Member row must have either member_id or member_name' using errcode = '22023';
      end if;
      insert into public.project_members (project_id, member_id, member_name, role)
      values (p_id, v_m_id, v_m_name, v_m_role);
    end loop;
  end if;

  -- Jangan masukkan nama/PII member ke payload audit; catat daftar kolom berubah + URL lama/baru.
  v_changed := to_jsonb(array_remove(array[
    case when r.cover_image is distinct from previous.cover_image then 'cover_image' end,
    case when r.description is distinct from previous.description then 'description' end,
    case when r.end_date is distinct from previous.end_date then 'end_date' end,
    case when r.featured is distinct from previous.featured then 'featured' end,
    case when p_changes ? 'members' and jsonb_typeof(p_changes->'members') = 'array' then 'members' end,
    case when r.project_url is distinct from previous.project_url then 'project_url' end,
    case when r.repository_url is distinct from previous.repository_url then 'repository_url' end,
    case when r.slug is distinct from previous.slug then 'slug' end,
    case when r.start_date is distinct from previous.start_date then 'start_date' end,
    case when r.status is distinct from previous.status then 'status' end,
    case when r.summary is distinct from previous.summary then 'summary' end,
    case when r.title is distinct from previous.title then 'title' end
  ], null));

  perform private.write_audit(
    auth.uid(),
    'PROJECT_UPDATED',
    'project',
    p_id,
    jsonb_build_object(
      'title', previous.title,
      'slug', previous.slug,
      'project_url', previous.project_url,
      'repository_url', previous.repository_url
    ),
    jsonb_build_object(
      'title', r.title,
      'slug', r.slug,
      'project_url', r.project_url,
      'repository_url', r.repository_url,
      'changed', v_changed
    )
  );

  return to_jsonb(r);
end;
$$;

create function public.publish_project(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  previous public.content_status;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select publication_status into previous from public.projects where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  if previous = 'PUBLISHED' then
    return;
  end if;

  update public.projects set publication_status = 'PUBLISHED' where id = p_id;

  perform private.write_audit(
    auth.uid(),
    'PROJECT_PUBLISHED',
    'project',
    p_id,
    jsonb_build_object('publication_status', previous),
    jsonb_build_object('publication_status', 'PUBLISHED')
  );
end;
$$;

create function public.delete_project(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  previous public.projects;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into previous from public.projects where id = p_id for update;
  if not found then
    raise no_data_found;
  end if;

  delete from public.projects where id = p_id;

  perform private.write_audit(
    auth.uid(),
    'PROJECT_DELETED',
    'project',
    p_id,
    jsonb_build_object('title', previous.title, 'slug', previous.slug),
    '{}'::jsonb
  );
end;
$$;

create function public.get_admin_project(p_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_proj public.projects;
  v_members jsonb;
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;

  select * into v_proj from public.projects where id = p_id;
  if not found then
    raise no_data_found;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', pm.id,
    'member_id', pm.member_id,
    'member_name', pm.member_name,
    'role', pm.role,
    'created_at', pm.created_at
  ) order by pm.created_at, pm.id), '[]'::jsonb)
  into v_members
  from public.project_members pm
  where pm.project_id = p_id;

  return jsonb_build_object(
    'id', v_proj.id,
    'title', v_proj.title,
    'slug', v_proj.slug,
    'summary', v_proj.summary,
    'description', v_proj.description,
    'cover_image', v_proj.cover_image,
    'project_url', v_proj.project_url,
    'repository_url', v_proj.repository_url,
    'start_date', v_proj.start_date,
    'end_date', v_proj.end_date,
    'status', v_proj.status,
    'publication_status', v_proj.publication_status,
    'featured', v_proj.featured,
    'members', v_members,
    'created_at', v_proj.created_at,
    'updated_at', v_proj.updated_at
  );
end;
$$;

-- 6. Hak eksekusi RPC untuk authenticated (admin aktif diperiksa di dalam fungsi)
revoke all on function public.create_competition(jsonb),
  public.update_competition(uuid, jsonb),
  public.publish_competition(uuid),
  public.delete_competition(uuid),
  public.create_achievement(jsonb),
  public.update_achievement(uuid, jsonb),
  public.publish_achievement(uuid),
  public.delete_achievement(uuid),
  public.get_admin_achievement(uuid),
  public.create_project(jsonb),
  public.update_project(uuid, jsonb),
  public.publish_project(uuid),
  public.delete_project(uuid),
  public.get_admin_project(uuid)
from public, anon, service_role;

grant execute on function public.create_competition(jsonb),
  public.update_competition(uuid, jsonb),
  public.publish_competition(uuid),
  public.delete_competition(uuid),
  public.create_achievement(jsonb),
  public.update_achievement(uuid, jsonb),
  public.publish_achievement(uuid),
  public.delete_achievement(uuid),
  public.get_admin_achievement(uuid),
  public.create_project(jsonb),
  public.update_project(uuid, jsonb),
  public.publish_project(uuid),
  public.delete_project(uuid),
  public.get_admin_project(uuid)
to authenticated;
