-- Additive foundation for Membership Data

-- 1. Alter existing `members` table (from organization foundation)
alter table public.members rename column name to full_name;
alter table public.members add column nim text unique check(char_length(nim) between 5 and 20);
alter table public.members add column email text unique check(email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$');
alter table public.members add column phone text check(phone ~ '^\+[1-9][0-9]{7,14}$');
alter table public.members add column faculty text check(char_length(faculty) between 2 and 100);
alter table public.members add column study_program text check(char_length(study_program) between 2 and 100);
alter table public.members add column batch int;
alter table public.members add column photo text;
alter table public.members add column bio text;
alter table public.members add column status text not null default 'ACTIVE' check(status in ('ACTIVE', 'INACTIVE', 'ALUMNI'));
alter table public.members add column joined_at timestamptz;
alter table public.members add column graduated_at timestamptz;
alter table public.members add column linkedin_url text check(linkedin_url ~* '^https?://');
alter table public.members add column github_url text check(github_url ~* '^https?://');
alter table public.members add column instagram_url text check(instagram_url ~* '^https?://');
alter table public.members add column public_profile boolean not null default true;
alter table public.members add column deleted_at timestamptz;

-- 2. Alter existing `membership_histories` table
alter table public.membership_histories add column start_date date;
alter table public.membership_histories add column end_date date;
alter table public.membership_histories add column notes text;

-- 3. Create `registrations` table
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check(char_length(full_name) between 1 and 120),
  nim text not null check(char_length(nim) between 5 and 20),
  email text not null check(email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
  phone text not null check(phone ~ '^\+[1-9][0-9]{7,14}$'),
  faculty text not null check(char_length(faculty) between 2 and 100),
  study_program text not null check(char_length(study_program) between 2 and 100),
  batch int not null,
  preferred_department_id uuid references public.departments(id) on delete set null,
  skills text,
  experience text,
  motivation text,
  portfolio_url text check(portfolio_url ~* '^https?://'),
  photo text,
  status text not null default 'SUBMITTED' check(status in ('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED')),
  admin_notes text,
  submitted_at timestamptz not null default statement_timestamp(),
  accepted_at timestamptz,
  rejected_at timestamptz,
  converted_member_id uuid unique references public.members(id) on delete set null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  check(converted_member_id is null or status = 'ACCEPTED')
);

-- Trigger for updated_at
create trigger registrations_updated before update on public.registrations for each row execute function private.touch_updated_at();

-- Satu registration hanya menghasilkan satu member; null tetap boleh untuk on delete set null.
create function private.guard_registration_conversion() returns trigger language plpgsql set search_path='' as $$
begin
  if old.converted_member_id is not null and new.converted_member_id is not null and new.converted_member_id <> old.converted_member_id then
    raise exception 'Registration already converted' using errcode = 'check_violation';
  end if;
  return new;
end;$$;
revoke all on function private.guard_registration_conversion() from public,anon,authenticated;
create trigger registrations_convert_once before update of converted_member_id on public.registrations for each row execute function private.guard_registration_conversion();

-- RLS for registrations
alter table public.registrations enable row level security;
revoke all on public.registrations from public,anon,authenticated;
-- Applicant bukan user login. Admin aktif hanya membaca; mutasi lewat RPC ter-audit (#28/#29).
grant select,insert,update,delete on public.registrations to service_role;
grant select on public.registrations to authenticated;

create policy active_admin_read_registrations on public.registrations for select to authenticated using((select private.has_active_admin_session()));
