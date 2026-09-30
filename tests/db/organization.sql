begin;

do $$
declare
  d uuid;
  p uuid;
  o uuid;
  m uuid;
begin
  insert into public.departments (name, slug) values ('UI/UX', 'ui-ux') returning id into d;
  insert into public.positions (name, level) values ('Member', 'Staff') returning id into p;
  insert into public.organization_periods (name, start_date, end_date, status) values ('2024/2025', '2024-08-01', '2025-07-31', 'ACTIVE') returning id into o;
  insert into public.members (name) values ('Test Member') returning id into m;
  
  insert into public.membership_histories (member_id, period_id, department_id, position_id)
  values (m, o, d, p);
  
  -- Attempt to delete department
  begin
    delete from public.departments where id = d;
    raise exception 'department delete guard failed';
  exception when foreign_key_violation then
    null; -- Expected
  end;

  -- Attempt to delete position
  begin
    delete from public.positions where id = p;
    raise exception 'position delete guard failed';
  exception when foreign_key_violation then
    null; -- Expected
  end;

  -- Attempt to delete period
  begin
    delete from public.organization_periods where id = o;
    raise exception 'organization period delete guard failed';
  exception when foreign_key_violation then
    null; -- Expected
  end;
end$$;

rollback;
