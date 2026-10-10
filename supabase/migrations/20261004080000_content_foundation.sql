-- Konten publik #11. Visibilitas memakai content_status (D17); lifecycle tetap enum terpisah.
-- Mutasi admin lewat RPC ber-audit (D13) belum ada di sini; anon/authenticated hanya SELECT.
create type public.competition_status as enum ('UPCOMING', 'OPEN', 'CLOSED', 'ONGOING', 'FINISHED');
create type public.project_status as enum ('PLANNED', 'ONGOING', 'COMPLETED', 'ARCHIVED');
-- U17: kode baku level; label tampilan urusan frontend.
create type public.content_level as enum ('INTERNAL', 'REGIONAL', 'NASIONAL', 'INTERNASIONAL');

create table public.competitions (
    id uuid primary key default gen_random_uuid(),
    title text not null check(char_length(title) between 1 and 255),
    slug text not null unique check(char_length(slug) between 1 and 160 and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    organizer text not null check(char_length(organizer) between 1 and 255),
    description text not null default '' check(char_length(description) <= 20000),
    category text check(char_length(category) <= 120),
    level public.content_level,
    registration_deadline date,
    competition_date date,
    registration_url text check(registration_url ~* '^https?://'),
    guidebook_url text check(guidebook_url ~* '^https?://'),
    poster text check(char_length(poster) <= 500),
    team_size text check(char_length(team_size) <= 100),
    eligibility text check(char_length(eligibility) <= 2000),
    status public.competition_status not null default 'UPCOMING',
    publication_status public.content_status not null default 'DRAFT',
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
    organizer text check(char_length(organizer) <= 255),
    level public.content_level,
    ranking text not null check(char_length(ranking) between 1 and 120),
    achievement_date date not null,
    description text not null default '' check(char_length(description) <= 20000),
    cover_image text check(char_length(cover_image) <= 500),
    publication_status public.content_status not null default 'DRAFT',
    created_at timestamptz not null default statement_timestamp(),
    updated_at timestamptz not null default statement_timestamp()
);

-- U18: sertifikat adalah media privat, hanya terbaca admin aktif.
create table public.achievement_certificates (
    achievement_id uuid primary key references public.achievements(id) on delete cascade,
    certificate_file text not null check(char_length(certificate_file) between 1 and 500),
    created_at timestamptz not null default statement_timestamp(),
    updated_at timestamptz not null default statement_timestamp()
);

-- D18: anggota tertaut lewat member_id, peserta non-member lewat member_name.
create table public.achievement_members (
    id uuid primary key default gen_random_uuid(),
    achievement_id uuid not null references public.achievements(id) on delete cascade,
    member_id uuid references public.members(id) on delete restrict,
    member_name text check(char_length(member_name) between 1 and 255),
    role text check(char_length(role) <= 120),
    created_at timestamptz not null default statement_timestamp(),
    check(member_id is not null or member_name is not null),
    unique(achievement_id, member_id)
);
create index achievement_members_member_id_idx on public.achievement_members(member_id);

create table public.projects (
    id uuid primary key default gen_random_uuid(),
    title text not null check(char_length(title) between 1 and 255),
    slug text not null unique check(char_length(slug) between 1 and 160 and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    summary text not null check(char_length(btrim(summary)) between 1 and 500),
    description text not null default '' check(char_length(description) <= 20000),
    cover_image text check(char_length(cover_image) <= 500),
    project_url text check(project_url ~* '^https?://'),
    repository_url text check(repository_url ~* '^https?://'),
    start_date date,
    end_date date,
    status public.project_status not null default 'PLANNED',
    publication_status public.content_status not null default 'DRAFT',
    featured boolean not null default false,
    created_at timestamptz not null default statement_timestamp(),
    updated_at timestamptz not null default statement_timestamp(),
    check(start_date is null or end_date is null or start_date <= end_date)
);

create table public.project_members (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.projects(id) on delete cascade,
    member_id uuid references public.members(id) on delete restrict,
    member_name text check(char_length(member_name) between 1 and 255),
    role text check(char_length(role) <= 120),
    created_at timestamptz not null default statement_timestamp(),
    check(member_id is not null or member_name is not null),
    unique(project_id, member_id)
);
create index project_members_member_id_idx on public.project_members(member_id);

comment on column public.competitions.poster is 'Referensi media, bukan URL; bentuk final ditetapkan alur upload #28/#29';
comment on column public.achievements.cover_image is 'Referensi media, bukan URL; bentuk final ditetapkan alur upload #28/#29';
comment on column public.projects.cover_image is 'Referensi media, bukan URL; bentuk final ditetapkan alur upload #28/#29';
comment on column public.achievement_certificates.certificate_file is 'Referensi media privat, bukan URL; bentuk final ditetapkan alur upload #28/#29';

revoke all on table public.competitions, public.achievements, public.achievement_members, public.projects, public.project_members from public, anon, authenticated;
grant select on table public.competitions, public.achievements, public.achievement_members, public.projects, public.project_members to authenticated;
-- D02: anon tidak membaca member_id.
grant select on table public.competitions, public.projects to anon;
grant select (id, title, slug, competition_name, organizer, level, ranking, achievement_date, description, cover_image, publication_status, created_at, updated_at) on public.achievements to anon;
grant select (id, achievement_id, member_name, role, created_at) on public.achievement_members to anon;
grant select (id, project_id, member_name, role, created_at) on public.project_members to anon;
grant all on table public.competitions, public.achievements, public.achievement_members, public.projects, public.project_members to service_role;
revoke all on table public.achievement_certificates from public, anon, authenticated;
grant select on table public.achievement_certificates to authenticated;
grant all on table public.achievement_certificates to service_role;

alter table public.competitions enable row level security;
alter table public.achievements enable row level security;
alter table public.achievement_certificates enable row level security;
alter table public.achievement_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;

create policy public_read_published_competitions on public.competitions for select to anon, authenticated using (publication_status = 'PUBLISHED');
create policy public_read_published_achievements on public.achievements for select to anon, authenticated using (publication_status = 'PUBLISHED');
create policy public_read_published_projects on public.projects for select to anon, authenticated using (publication_status = 'PUBLISHED');
create policy public_read_published_achievement_members on public.achievement_members for select to anon, authenticated
  using (exists (select from public.achievements a where a.id = achievement_members.achievement_id and a.publication_status = 'PUBLISHED'));
create policy public_read_published_project_members on public.project_members for select to anon, authenticated
  using (exists (select from public.projects p where p.id = project_members.project_id and p.publication_status = 'PUBLISHED'));

create policy active_admin_read_competitions on public.competitions for select to authenticated using ((select private.has_active_admin_session()));
create policy active_admin_read_achievements on public.achievements for select to authenticated using ((select private.has_active_admin_session()));
create policy active_admin_read_achievement_certificates on public.achievement_certificates for select to authenticated using ((select private.has_active_admin_session()));
create policy active_admin_read_achievement_members on public.achievement_members for select to authenticated using ((select private.has_active_admin_session()));
create policy active_admin_read_projects on public.projects for select to authenticated using ((select private.has_active_admin_session()));
create policy active_admin_read_project_members on public.project_members for select to authenticated using ((select private.has_active_admin_session()));

create trigger competitions_updated before update on public.competitions for each row execute function private.touch_updated_at();
create trigger achievements_updated before update on public.achievements for each row execute function private.touch_updated_at();
create trigger achievement_certificates_updated before update on public.achievement_certificates for each row execute function private.touch_updated_at();
create trigger projects_updated before update on public.projects for each row execute function private.touch_updated_at();
