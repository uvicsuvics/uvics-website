begin;

do $$
declare
  d uuid;
  p uuid;
  o uuid;
  m uuid;
  r uuid;
begin
  insert into public.departments (name, slug) values ('UI/UX', 'ui-ux2') returning id into d;
  insert into public.positions (name, level) values ('Member', 'Staff') returning id into p;
  insert into public.organization_periods (name, start_date, end_date, status) values ('2025/2026', '2025-08-01', '2026-07-31', 'UPCOMING') returning id into o;
  
  -- Test registration insert
  insert into public.registrations (
    full_name, nim, email, phone, faculty, study_program, batch, preferred_department_id
  ) values (
    'Test Applicant', '105021810011', 'applicant@student.unklab.ac.id', '08123456789', 'FIK', 'Informatika', 2023, d
  ) returning id into r;

  -- Test member insert
  insert into public.members (
    full_name, nim, email, phone, faculty, study_program, batch, status
  ) values (
    'Test Member', '105021810012', 'member@student.unklab.ac.id', '08123456780', 'FIK', 'Informatika', 2023, 'ACTIVE'
  ) returning id into m;
  
  -- Test membership history insert
  insert into public.membership_histories (
    member_id, organization_period_id, department_id, position_id, start_date
  ) values (
    m, o, d, p, '2025-08-01'
  );
  
  -- Test soft delete strategy for members (update deleted_at)
  update public.members set deleted_at = statement_timestamp() where id = m;
  if not found then
    raise exception 'Soft delete failed';
  end if;

  -- Test that converted_member_id prevents multiple registrations converting to same member
  update public.registrations set status = 'ACCEPTED', converted_member_id = m where id = r;
  
  begin
    insert into public.registrations (
      full_name, nim, email, phone, faculty, study_program, batch
    ) values (
      'Duplicate Convert', '105021810013', 'dup@student.unklab.ac.id', '08123456781', 'FIK', 'Informatika', 2023
    );
    update public.registrations set status = 'ACCEPTED', converted_member_id = m where nim = '105021810013';
    raise exception 'Multiple registrations converted to same member guard failed';
  exception when unique_violation then
    null; -- Expected due to unique constraint on converted_member_id
  end;

end$$;

rollback;
