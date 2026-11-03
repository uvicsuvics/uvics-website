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

  -- Test member insert with valid photo media reference and valid social URLs
  insert into public.members (
    full_name, nim, email, phone, faculty, study_program, batch, status,
    photo, linkedin_url, github_url, instagram_url
  ) values (
    'Test Member', '105021810012', 'member@student.unklab.ac.id', '+628123456780', 'FIK', 'Informatika', 2023, 'ACTIVE',
    'uvics/members/photo-10012.webp',
    'https://www.linkedin.com/in/testmember',
    'https://github.com/testmember',
    'https://instagram.com/testmember'
  ) returning id into m;
  
  -- Test membership history insert with valid date range
  insert into public.membership_histories (
    member_id, organization_period_id, department_id, position_id, start_date, end_date
  ) values (
    m, o, d, p, '2025-08-01', '2026-07-31'
  );

  -- Constraint tests (Issue #54):
  -- 1. members.photo: reject URL
  begin
    insert into public.members (full_name, photo) values ('URL Photo', 'https://example.com/photo.jpg');
    raise exception 'external photo URL must be rejected by check constraint';
  exception when check_violation then
    null;
  end;

  -- 2. members.photo: reject length > 500
  begin
    insert into public.members (full_name, photo) values ('Long Photo', repeat('a', 501));
    raise exception 'photo exceeding 500 chars must be rejected';
  exception when check_violation then
    null;
  end;

  -- 3. membership_histories date range: reject end_date < start_date
  begin
    insert into public.membership_histories (
      member_id, organization_period_id, department_id, position_id, start_date, end_date
    ) values (
      m, o, d, p, '2026-07-31', '2025-08-01'
    );
    raise exception 'membership_history with end_date < start_date must be rejected';
  exception when check_violation then
    null;
  end;

  -- 4. Social URLs: reject prefix-only ('https://') or invalid schemes ('javascript:...')
  begin
    insert into public.members (full_name, linkedin_url) values ('Bad LinkedIn', 'https://');
    raise exception 'prefix-only linkedin URL must be rejected';
  exception when check_violation then
    null;
  end;

  begin
    insert into public.members (full_name, github_url) values ('Bad GitHub', 'javascript:alert(1)');
    raise exception 'javascript scheme github URL must be rejected';
  exception when check_violation then
    null;
  end;

  begin
    insert into public.members (full_name, instagram_url) values ('Bad Instagram', 'https://');
    raise exception 'prefix-only instagram URL must be rejected';
  exception when check_violation then
    null;
  end;

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

-- ============================================================
-- Role 1: Active Admin (Authenticated with valid admin session)
-- ============================================================
select set_config('request.jwt.claims', jsonb_build_object('sub', '00000000-0000-4000-8000-000000000001'::uuid, 'session_id', '00000000-0000-4000-8000-000000000011'::uuid)::text, true);
set local role authenticated;
do $$
declare
  target_member uuid;
  del_res jsonb;
begin
  -- 1. Admin can read active members (deleted_at is null)
  select id into target_member from public.members where nim = '105021810012';
  if target_member is null then
    raise exception 'active admin must be able to read active members';
  end if;

  -- 2. Direct DML on members is blocked (D13)
  begin
    delete from public.members where id = target_member;
    raise exception 'direct delete on members must be blocked';
  exception when insufficient_privilege then
    null;
  end;

  -- 3. Execute audited RPC admin_soft_delete_member
  del_res := public.admin_soft_delete_member(target_member);
  if del_res->>'deleted' <> 'true' then
    raise exception 'admin_soft_delete_member must return deleted: true';
  end if;

  -- 4. Member with deleted_at must not be readable via RLS
  if exists(select from public.members where id = target_member) then
    raise exception 'soft deleted member must not be visible in admin read query';
  end if;

  -- 5. Soft-deleted member cannot be deleted again (returns no_data_found)
  begin
    perform public.admin_soft_delete_member(target_member);
    raise exception 'calling soft delete on already deleted member must raise no_data_found';
  exception when no_data_found then
    null;
  end;

  -- 6. Audit log must exist for soft delete
  if not exists(
    select from public.audit_logs
    where action = 'MEMBER_SOFT_DELETED'
      and entity_type = 'member'
      and entity_id = target_member
      and actor_id = '00000000-0000-4000-8000-000000000001'
  ) then
    raise exception 'audit log for MEMBER_SOFT_DELETED was not recorded';
  end if;

  -- 7. Admin can read registrations but cannot direct-write
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

-- ============================================================
-- Role 2: Authenticated Non-Admin
-- ============================================================
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002"}', true);
set local role authenticated;
do $$
begin
  if exists(select from public.members) then
    raise exception 'non-admin should not be able to read members';
  end if;
  if exists(select from public.registrations) then
    raise exception 'non-admin should not be able to read registrations';
  end if;

  -- Calling RPC raises insufficient_privilege
  begin
    perform public.admin_soft_delete_member('00000000-0000-4000-8000-000000000001');
    raise exception 'non-admin must not execute admin_soft_delete_member';
  exception when insufficient_privilege then
    null;
  end;
end$$;
reset role;

-- ============================================================
-- Role 3: Anon (Unauthenticated)
-- ============================================================
set local role anon;
do $$
begin
  begin
    perform id from public.members;
    raise exception 'anon should not have access to members';
  exception when insufficient_privilege then
    null;
  end;

  begin
    perform id from public.registrations;
    raise exception 'anon should not have access to registrations';
  exception when insufficient_privilege then
    null;
  end;

  begin
    perform public.admin_soft_delete_member('00000000-0000-4000-8000-000000000001');
    raise exception 'anon must not have execute privilege on admin_soft_delete_member';
  exception when insufficient_privilege then
    null;
  end;
end$$;
reset role;

rollback;
