begin;

-- Seed synthetic auth fixture for testing RLS policies
insert into auth.users (id) values ('00000000-0000-4000-8000-000000000001'), ('00000000-0000-4000-8000-000000000002');
insert into public.admins (id, name, is_active) values ('00000000-0000-4000-8000-000000000001', 'Synthetic Admin', true);
insert into auth.sessions (id, user_id, created_at) values ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', statement_timestamp());

do $$
declare
  d uuid;
  p uuid;
  o uuid;
  m uuid;
  h uuid;
begin
  insert into public.departments (name, slug) values ('UI/UX', 'ui-ux') returning id into d;
  insert into public.positions (name, level) values ('Member', 'Staff') returning id into p;
  insert into public.organization_periods (name, start_date, end_date, status) values ('2024/2025', '2024-08-01', '2025-07-31', 'ACTIVE') returning id into o;
  insert into public.members (full_name) values ('Test Member') returning id into m;
  
  insert into public.membership_histories (member_id, organization_period_id, department_id, position_id)
  values (m, o, d, p) returning id into h;
  
  -- ==============================================================
  -- TEST D: Delete guards (ON DELETE RESTRICT)
  -- ==============================================================
  -- Attempt to delete department
  begin
    delete from public.departments where id = d;
    raise exception 'department delete guard failed';
  exception when foreign_key_violation or restrict_violation or sqlstate '23001' then
    null; -- Expected
  end;

  -- Attempt to delete position
  begin
    delete from public.positions where id = p;
    raise exception 'position delete guard failed';
  exception when foreign_key_violation or restrict_violation or sqlstate '23001' then
    null; -- Expected
  end;

  -- Attempt to delete period
  begin
    delete from public.organization_periods where id = o;
    raise exception 'organization period delete guard failed';
  exception when foreign_key_violation or restrict_violation or sqlstate '23001' then
    null; -- Expected
  end;

  -- Attempt to delete member
  begin
    delete from public.members where id = m;
    raise exception 'member delete guard failed';
  exception when foreign_key_violation or restrict_violation or sqlstate '23001' then
    null; -- Expected
  end;

  -- ==============================================================
  -- TEST A: Single active period enforcement
  -- ==============================================================
  begin
    insert into public.organization_periods (name, start_date, end_date, status)
    values ('2025/2026', '2025-08-01', '2026-07-31', 'ACTIVE');
    raise exception 'second active period should have been rejected';
  exception when unique_violation then
    null; -- Expected
  end;

  -- Non-active period should be allowed alongside ACTIVE
  insert into public.organization_periods (name, start_date, end_date, status)
  values ('2023/2024', '2023-08-01', '2024-07-31', 'ENDED');

  -- ==============================================================
  -- TEST B: Date consistency (start_date <= end_date)
  -- ==============================================================
  -- start_date = end_date allowed
  insert into public.organization_periods (name, start_date, end_date, status)
  values ('Single Day', '2025-01-01', '2025-01-01', 'UPCOMING');

  -- end_date < start_date rejected
  begin
    insert into public.organization_periods (name, start_date, end_date, status)
    values ('Invalid Dates', '2025-08-01', '2024-07-31', 'UPCOMING');
    raise exception 'end_date < start_date should have been rejected';
  exception when check_violation then
    null; -- Expected
  end;

  -- ==============================================================
  -- TEST C: Department slug validation
  -- ==============================================================
  -- Valid kebab-case allowed
  insert into public.departments (name, slug) values ('Software Eng', 'software-eng');

  -- Duplicate slug rejected
  begin
    insert into public.departments (name, slug) values ('Duplicate Slug', 'ui-ux');
    raise exception 'duplicate slug should have been rejected';
  exception when unique_violation then
    null; -- Expected
  end;

  -- Invalid slug: uppercase rejected
  begin
    insert into public.departments (name, slug) values ('Upper Slug', 'UI-UX');
    raise exception 'uppercase slug should have been rejected';
  exception when check_violation then
    null; -- Expected
  end;

  -- Invalid slug: spaces rejected
  begin
    insert into public.departments (name, slug) values ('Space Slug', 'ui ux');
    raise exception 'slug with space should have been rejected';
  exception when check_violation then
    null; -- Expected
  end;

  -- Invalid slug: underscores rejected
  begin
    insert into public.departments (name, slug) values ('Underscore Slug', 'ui_ux');
    raise exception 'slug with underscore should have been rejected';
  exception when check_violation then
    null; -- Expected
  end;

  -- Invalid slug: consecutive hyphens rejected
  begin
    insert into public.departments (name, slug) values ('Multi Hyphen Slug', 'ui--ux');
    raise exception 'slug with consecutive hyphens should have been rejected';
  exception when check_violation then
    null; -- Expected
  end;

  -- Invalid slug: leading hyphen rejected
  begin
    insert into public.departments (name, slug) values ('Leading Hyphen Slug', '-ui-ux');
    raise exception 'slug with leading hyphen should have been rejected';
  exception when check_violation then
    null; -- Expected
  end;

  -- Invalid slug: trailing hyphen rejected
  begin
    insert into public.departments (name, slug) values ('Trailing Hyphen Slug', 'ui-ux-');
    raise exception 'slug with trailing hyphen should have been rejected';
  exception when check_violation then
    null; -- Expected
  end;
end$$;

-- ==============================================================
-- TEST E: RLS / Access tests
-- ==============================================================
-- 1. Active admin should be able to read private rows
select set_config('request.jwt.claims', jsonb_build_object('sub', '00000000-0000-4000-8000-000000000001'::uuid, 'session_id', '00000000-0000-4000-8000-000000000011'::uuid)::text, true);
set local role authenticated;
do $$
begin
  if (select count(*) from public.departments) = 0 then
    raise exception 'active admin should be able to read departments';
  end if;
  if (select count(*) from public.positions) = 0 then
    raise exception 'active admin should be able to read positions';
  end if;
  if (select count(*) from public.organization_periods) = 0 then
    raise exception 'active admin should be able to read organization_periods';
  end if;
  if (select count(*) from public.members) = 0 then
    raise exception 'active admin should be able to read members';
  end if;
  if (select count(*) from public.membership_histories) = 0 then
    raise exception 'active admin should be able to read membership_histories';
  end if;
end$$;
reset role;

-- 2. Authenticated non-admin should receive 0 rows
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002"}', true);
set local role authenticated;
do $$
begin
  if exists(select from public.departments) then
    raise exception 'non-admin should not be able to read departments';
  end if;
  if exists(select from public.positions) then
    raise exception 'non-admin should not be able to read positions';
  end if;
  if exists(select from public.organization_periods) then
    raise exception 'non-admin should not be able to read organization_periods';
  end if;
  if exists(select from public.members) then
    raise exception 'non-admin should not be able to read members';
  end if;
  if exists(select from public.membership_histories) then
    raise exception 'non-admin should not be able to read membership_histories';
  end if;
end$$;
reset role;

-- 3. Anon role must be denied access to private tables
set local role anon;
do $$
begin
  begin
    perform id from public.departments;
    raise exception 'anon should not have access to departments';
  exception when insufficient_privilege then
    null; -- Expected
  end;

  begin
    perform id from public.positions;
    raise exception 'anon should not have access to positions';
  exception when insufficient_privilege then
    null; -- Expected
  end;

  begin
    perform id from public.organization_periods;
    raise exception 'anon should not have access to organization_periods';
  exception when insufficient_privilege then
    null; -- Expected
  end;

  begin
    perform id from public.members;
    raise exception 'anon should not have access to members';
  exception when insufficient_privilege then
    null; -- Expected
  end;

  begin
    perform id from public.membership_histories;
    raise exception 'anon should not have access to membership_histories';
  exception when insufficient_privilege then
    null; -- Expected
  end;
end$$;
reset role;

rollback;
