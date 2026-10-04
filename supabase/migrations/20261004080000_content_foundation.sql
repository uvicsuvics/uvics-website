create type public.competition_status as enum ('UPCOMING', 'OPEN', 'CLOSED', 'ONGOING', 'FINISHED');
create type public.project_status as enum ('PLANNED', 'ONGOING', 'COMPLETED', 'ARCHIVED');

create table public.competitions (
    id uuid primary key default gen_random_uuid(),
    title text not null check(char_length(title) between 1 and 255),
    slug text not null unique check(char_length(slug) between 1 and 160 and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    organizer text not null check(char_length(organizer) between 1 and 255),
    description text not null default '',
    category text,
    level text,
    registration_deadline date,
    competition_date date,
    registration_url text,
    guidebook_url text,
    poster_url text,
    team_size text,
    eligibility text,
    status public.competition_status not null default 'UPCOMING',
    featured boolean not null default false,
    created_at timestamptz not null default statement_timestamp(),
    updated_at timestamptz not null default statement_timestamp(),
    check(registration_deadline is null or competition_date is null or registration_deadline <= competition_date)
);

create table public.achievements (
    id uuid primary key default gen_random_uuid(),
    title text not null check(char_length(title) between 1 and 255),
    slug text not null unique check(char_length(slug) between 1 and 160 and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    competition_name text not null check(char_length(competition_name) between 1 and 255),
    organizer text,
    level text,
    ranking text not null,
    achievement_date date not null,
    description text not null default '',
    cover_image text,
    certificate_file text,
    published boolean not null default false,
    created_at timestamptz not null default statement_timestamp(),
    updated_at timestamptz not null default statement_timestamp()
);

create table public.achievement_members (
    id uuid primary key default gen_random_uuid(),
    achievement_id uuid not null references public.achievements(id) on delete cascade,
    member_name text not null check(char_length(member_name) between 1 and 255),
    role text,
    created_at timestamptz not null default statement_timestamp()
);
create index achievement_members_achievement_id_idx on public.achievement_members(achievement_id);

create table public.projects (
    id uuid primary key default gen_random_uuid(),
    title text not null check(char_length(title) between 1 and 255),
    slug text not null unique check(char_length(slug) between 1 and 160 and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    summary text not null check(char_length(summary) <= 500),
    description text not null default '',
    cover_image text,
    project_url text,
    repository_url text,
    start_date date,
    end_date date,
    status public.project_status not null default 'PLANNED',
    featured boolean not null default false,
    created_at timestamptz not null default statement_timestamp(),
    updated_at timestamptz not null default statement_timestamp(),
    check(start_date is null or end_date is null or start_date <= end_date)
);

create table public.project_members (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.projects(id) on delete cascade,
    member_name text not null check(char_length(member_name) between 1 and 255),
    role text,
    created_at timestamptz not null default statement_timestamp()
);
create index project_members_project_id_idx on public.project_members(project_id);

-- Access setup
revoke all on public.competitions from public,anon,authenticated;
grant select on public.competitions to anon,authenticated;
grant insert,update,delete on public.competitions to authenticated;
grant all on public.competitions to service_role;

revoke all on public.achievements from public,anon,authenticated;
grant select on public.achievements to anon,authenticated;
grant insert,update,delete on public.achievements to authenticated;
grant all on public.achievements to service_role;

revoke all on public.achievement_members from public,anon,authenticated;
grant select on public.achievement_members to anon,authenticated;
grant insert,update,delete on public.achievement_members to authenticated;
grant all on public.achievement_members to service_role;

revoke all on public.projects from public,anon,authenticated;
grant select on public.projects to anon,authenticated;
grant insert,update,delete on public.projects to authenticated;
grant all on public.projects to service_role;

revoke all on public.project_members from public,anon,authenticated;
grant select on public.project_members to anon,authenticated;
grant insert,update,delete on public.project_members to authenticated;
grant all on public.project_members to service_role;

-- Row Level Security
alter table public.competitions enable row level security;
alter table public.achievements enable row level security;
alter table public.achievement_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;

-- Policies for anon/authenticated (Public View)
-- For public, we allow viewing all competitions. In the future we might restrict based on some other flags if needed.
create policy "Public can view competitions" on public.competitions for select to anon, authenticated using (true);
create policy "Public can view published achievements" on public.achievements for select to anon, authenticated using (published = true);
-- We allow viewing members if their achievement is published
create policy "Public can view members of published achievements" on public.achievement_members for select to anon, authenticated using (
  exists (select 1 from public.achievements where id = achievement_members.achievement_id and published = true)
);
create policy "Public can view projects" on public.projects for select to anon, authenticated using (true);
create policy "Public can view members of projects" on public.project_members for select to anon, authenticated using (true);

-- Policies for Admins (Full Access)
create policy "Admins have full access to competitions" on public.competitions to authenticated using ((select private.has_active_admin_session()));
create policy "Admins have full access to achievements" on public.achievements to authenticated using ((select private.has_active_admin_session()));
create policy "Admins have full access to achievement members" on public.achievement_members to authenticated using ((select private.has_active_admin_session()));
create policy "Admins have full access to projects" on public.projects to authenticated using ((select private.has_active_admin_session()));
create policy "Admins have full access to project members" on public.project_members to authenticated using ((select private.has_active_admin_session()));

create policy "Admins can insert competitions" on public.competitions for insert to authenticated with check ((select private.has_active_admin_session()));
create policy "Admins can update competitions" on public.competitions for update to authenticated using ((select private.has_active_admin_session())) with check ((select private.has_active_admin_session()));
create policy "Admins can delete competitions" on public.competitions for delete to authenticated using ((select private.has_active_admin_session()));

create policy "Admins can insert achievements" on public.achievements for insert to authenticated with check ((select private.has_active_admin_session()));
create policy "Admins can update achievements" on public.achievements for update to authenticated using ((select private.has_active_admin_session())) with check ((select private.has_active_admin_session()));
create policy "Admins can delete achievements" on public.achievements for delete to authenticated using ((select private.has_active_admin_session()));

create policy "Admins can insert achievement members" on public.achievement_members for insert to authenticated with check ((select private.has_active_admin_session()));
create policy "Admins can update achievement members" on public.achievement_members for update to authenticated using ((select private.has_active_admin_session())) with check ((select private.has_active_admin_session()));
create policy "Admins can delete achievement members" on public.achievement_members for delete to authenticated using ((select private.has_active_admin_session()));

create policy "Admins can insert projects" on public.projects for insert to authenticated with check ((select private.has_active_admin_session()));
create policy "Admins can update projects" on public.projects for update to authenticated using ((select private.has_active_admin_session())) with check ((select private.has_active_admin_session()));
create policy "Admins can delete projects" on public.projects for delete to authenticated using ((select private.has_active_admin_session()));

create policy "Admins can insert project members" on public.project_members for insert to authenticated with check ((select private.has_active_admin_session()));
create policy "Admins can update project members" on public.project_members for update to authenticated using ((select private.has_active_admin_session())) with check ((select private.has_active_admin_session()));
create policy "Admins can delete project members" on public.project_members for delete to authenticated using ((select private.has_active_admin_session()));

-- Triggers for updated_at
create trigger competitions_updated before update on public.competitions for each row execute function private.touch_updated_at();
create trigger achievements_updated before update on public.achievements for each row execute function private.touch_updated_at();
create trigger projects_updated before update on public.projects for each row execute function private.touch_updated_at();
