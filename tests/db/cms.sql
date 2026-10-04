begin;
-- Assumes auth and admins are set up in foundation.sql or similar fixture before this runs
insert into auth.users values('00000000-0000-4000-8000-000000000003');
insert into public.admins(id,name,is_active) values('00000000-0000-4000-8000-000000000003','CMS Admin',true);
insert into auth.sessions values('00000000-0000-4000-8000-000000000013','00000000-0000-4000-8000-000000000003',statement_timestamp());

do $$
declare
  u uuid := '00000000-0000-4000-8000-000000000003';
  s uuid := '00000000-0000-4000-8000-000000000013';
  comp_id uuid;
  ach_id uuid;
  proj_id uuid;
begin
  -- Authenticated Admin context
  perform set_config('request.jwt.claims', jsonb_build_object('sub', u, 'session_id', s)::text, true);
  
  -- Insert Competition
  insert into public.competitions (title, slug, organizer, description) 
  values ('Test Comp', 'test-comp', 'Org', 'Desc') returning id into comp_id;
  
  if (select count(*) from public.competitions where id = comp_id) <> 1 then
    raise exception 'Admin could not insert competition';
  end if;

  -- Insert Achievement
  insert into public.achievements (title, slug, competition_name, ranking, achievement_date) 
  values ('Test Ach', 'test-ach', 'Test Comp', '1st', '2026-01-01') returning id into ach_id;
  
  -- Insert Achievement Member
  insert into public.achievement_members (achievement_id, member_name, role) 
  values (ach_id, 'Alice', 'Leader');

  -- Insert Project
  insert into public.projects (title, slug, summary) 
  values ('Test Proj', 'test-proj', 'Summary') returning id into proj_id;

  -- Insert Project Member
  insert into public.project_members (project_id, member_name, role) 
  values (proj_id, 'Bob', 'Dev');

end$$;

-- Test Public Access
set local role anon;
do $$
declare
  ach_id uuid;
begin
  -- Competitions should be visible
  if (select count(*) from public.competitions where slug = 'test-comp') <> 1 then
    raise exception 'Anon cannot view competitions';
  end if;

  -- Projects should be visible
  if (select count(*) from public.projects where slug = 'test-proj') <> 1 then
    raise exception 'Anon cannot view projects';
  end if;

  -- Achievements should NOT be visible because published is false by default
  if (select count(*) from public.achievements where slug = 'test-ach') > 0 then
    raise exception 'Anon should not view unpublished achievements';
  end if;

end$$;
reset role;

-- Publish achievement as admin
do $$
declare
  u uuid := '00000000-0000-4000-8000-000000000003';
  s uuid := '00000000-0000-4000-8000-000000000013';
begin
  perform set_config('request.jwt.claims', jsonb_build_object('sub', u, 'session_id', s)::text, true);
  update public.achievements set published = true where slug = 'test-ach';
end$$;

-- Test Public Access again
set local role anon;
do $$
begin
  if (select count(*) from public.achievements where slug = 'test-ach') <> 1 then
    raise exception 'Anon cannot view published achievements';
  end if;
  
  if (select count(*) from public.achievement_members where member_name = 'Alice') <> 1 then
    raise exception 'Anon cannot view members of published achievements';
  end if;
end$$;
reset role;

rollback;
