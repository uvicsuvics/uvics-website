-- Additive foundation for Organization Data
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null check(char_length(name) between 1 and 120),
  slug text not null unique check(char_length(slug) between 1 and 120),
  description text,
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

create table public.positions (
  id uuid primary key default gen_random_uuid(),
  name text not null check(char_length(name) between 1 and 120),
  description text,
  level text not null check(char_length(level) between 1 and 80),
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

create table public.organization_periods (
  id uuid primary key default gen_random_uuid(),
  name text not null check(char_length(name) between 1 and 120),
  start_date date not null,
  end_date date not null,
  status text not null check(status in ('UPCOMING', 'ACTIVE', 'ENDED')),
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  check(start_date <= end_date)
);

-- Hanya satu active period
create unique index single_active_period on public.organization_periods (status) where status = 'ACTIVE';

create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null check(char_length(name) between 1 and 120),
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

create table public.membership_histories (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete restrict,
  period_id uuid not null references public.organization_periods(id) on delete restrict,
  department_id uuid not null references public.departments(id) on delete restrict,
  position_id uuid not null references public.positions(id) on delete restrict,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

create trigger departments_updated before update on public.departments for each row execute function private.touch_updated_at();
create trigger positions_updated before update on public.positions for each row execute function private.touch_updated_at();
create trigger organization_periods_updated before update on public.organization_periods for each row execute function private.touch_updated_at();
create trigger members_updated before update on public.members for each row execute function private.touch_updated_at();
create trigger membership_histories_updated before update on public.membership_histories for each row execute function private.touch_updated_at();

alter table public.departments enable row level security;
revoke all on public.departments from public,anon,authenticated;
grant select on public.departments to anon,authenticated;
grant select,insert,update,delete on public.departments to service_role;

alter table public.positions enable row level security;
revoke all on public.positions from public,anon,authenticated;
grant select on public.positions to anon,authenticated;
grant select,insert,update,delete on public.positions to service_role;

alter table public.organization_periods enable row level security;
revoke all on public.organization_periods from public,anon,authenticated;
grant select on public.organization_periods to anon,authenticated;
grant select,insert,update,delete on public.organization_periods to service_role;

alter table public.members enable row level security;
revoke all on public.members from public,anon,authenticated;
grant select on public.members to service_role;
grant select,insert,update,delete on public.members to service_role;

alter table public.membership_histories enable row level security;
revoke all on public.membership_histories from public,anon,authenticated;
grant select on public.membership_histories to service_role;
grant select,insert,update,delete on public.membership_histories to service_role;

create policy active_admin_read on public.departments for select to authenticated using((select private.has_active_admin_session()));
create policy active_admin_read on public.positions for select to authenticated using((select private.has_active_admin_session()));
create policy active_admin_read on public.organization_periods for select to authenticated using((select private.has_active_admin_session()));
create policy active_admin_read on public.members for select to authenticated using((select private.has_active_admin_session()));
create policy active_admin_read on public.membership_histories for select to authenticated using((select private.has_active_admin_session()));
