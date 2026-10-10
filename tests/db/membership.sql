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
  m2 uuid;
  r uuid;
  r2 uuid;
begin
  insert into public.departments (name, slug) values ('UI/UX', 'ui-ux2') returning id into d;
  insert into public.positions (name, level) values ('Member', 'Staff') returning id into p;
  insert into public.organization_periods (name, start_date, end_date, status) values ('2025/2026', '2025-08-01', '2026-07-31', 'UPCOMING') returning id into o;
  
  -- Test registration insert
  insert into public.registrations (
    full_name, nim, email, phone, faculty, study_program, batch, preferred_department_id
  ) values (
    'Test Applicant', '105021810011', 'applicant@student.unklab.ac.id', '+628123456789', 'FIK', 'Informatika', 2023, d
  ) returning id into r;

  -- Test member insert
  insert into public.members (
    full_name, nim, email, phone, faculty, study_program, batch, status
  ) values (
    'Test Member', '105021810012', 'member@student.unklab.ac.id', '+628123456780', 'FIK', 'Informatika', 2023, 'ACTIVE'
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
      'Duplicate Convert', '105021810013', 'dup@student.unklab.ac.id', '+628123456781', 'FIK', 'Informatika', 2023
    );
    update public.registrations set status = 'ACCEPTED', converted_member_id = m where nim = '105021810013';
    raise exception 'Multiple registrations converted to same member guard failed';
  exception when unique_violation then
    null; -- Expected due to unique constraint on converted_member_id
  end;

  -- D04: telepon tersimpan wajib ternormalisasi +kodenegara
  begin
    insert into public.registrations (full_name, nim, email, phone, faculty, study_program, batch)
    values ('Raw Phone', '105021810014', 'raw@student.unklab.ac.id', '08123456782', 'FIK', 'Informatika', 2023);
    raise exception 'unnormalized phone should be rejected';
  exception when check_violation then
    null;
  end;

  -- Issue #8: satu registration hanya dikonversi sekali, dan hanya bila ACCEPTED
  insert into public.members (full_name) values ('Second Member') returning id into m2;
  begin
    update public.registrations set converted_member_id = m2 where id = r;
    raise exception 'registration must not be converted twice';
  exception when check_violation then
    null;
  end;
  begin
    insert into public.registrations (full_name, nim, email, phone, faculty, study_program, batch, status)
    values ('Rejected Applicant', '105021810015', 'rejected@student.unklab.ac.id', '+628123456783', 'FIK', 'Informatika', 2023, 'REJECTED')
    returning id into r2;
    update public.registrations set converted_member_id = m2 where id = r2;
    raise exception 'rejected registration must not be converted';
  exception when check_violation then
    null;
  end;

end$$;

-- RLS registrations: admin hanya baca, non-admin nihil, anon ditolak
select set_config('request.jwt.claims', jsonb_build_object('sub', '00000000-0000-4000-8000-000000000001'::uuid, 'session_id', '00000000-0000-4000-8000-000000000011'::uuid)::text, true);
set local role authenticated;
do $$
begin
  if not exists(select from public.registrations) then
    raise exception 'active admin should be able to read registrations';
  end if;
  begin
    update public.registrations set admin_notes = 'direct write';
    raise exception 'direct registration update must go through an audited RPC';
  exception when insufficient_privilege then
    null;
  end;
end$$;
reset role;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002"}', true);
set local role authenticated;
do $$
begin
  if exists(select from public.registrations) then
    raise exception 'non-admin should not be able to read registrations';
  end if;
end$$;
reset role;

set local role anon;
do $$
begin
  begin
    perform id from public.registrations;
    raise exception 'anon should not have access to registrations';
  exception when insufficient_privilege then
    null;
  end;
end$$;
reset role;

rollback;
