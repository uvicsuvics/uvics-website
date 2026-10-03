create type public.content_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');

create table public.pages (
    id uuid primary key default gen_random_uuid(),
    title text not null check(char_length(title) between 1 and 255),
    slug text not null unique check(char_length(slug) between 1 and 160 and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    content text not null default '',
    meta_title text check(char_length(meta_title) <= 255),
    meta_description text check(char_length(meta_description) <= 500),
    status public.content_status not null default 'DRAFT',
    published_at timestamptz,
    created_at timestamptz not null default statement_timestamp(),
    updated_at timestamptz not null default statement_timestamp()
);

create table public.programs (
    id uuid primary key default gen_random_uuid(),
    name text not null check(char_length(name) between 1 and 255),
    slug text not null unique check(char_length(slug) between 1 and 160 and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    short_description text check(char_length(short_description) <= 500),
    description text not null default '',
    image text,
    status public.content_status not null default 'DRAFT',
    display_order integer not null default 0,
    created_at timestamptz not null default statement_timestamp(),
    updated_at timestamptz not null default statement_timestamp()
);

create table public.website_settings (
    key text primary key check(key ~ '^[a-z_]+$'),
    value jsonb not null default 'null',
    updated_at timestamptz not null default statement_timestamp(),
    updated_by uuid references public.admins(id) on delete set null
);

-- Access setup
revoke all on public.pages from public,anon,authenticated;
grant select on public.pages to anon,authenticated;
grant insert,update,delete on public.pages to authenticated;
grant all on public.pages to service_role;

revoke all on public.programs from public,anon,authenticated;
grant select on public.programs to anon,authenticated;
grant insert,update,delete on public.programs to authenticated;
grant all on public.programs to service_role;

revoke all on public.website_settings from public,anon,authenticated;
grant select on public.website_settings to anon,authenticated;
grant insert,update,delete on public.website_settings to authenticated;
grant all on public.website_settings to service_role;

-- Row Level Security
alter table public.pages enable row level security;
alter table public.programs enable row level security;
alter table public.website_settings enable row level security;

-- Policies for anon/authenticated (Public View)
create policy "Public can view published pages" on public.pages for select to anon, authenticated using (status = 'PUBLISHED');
create policy "Public can view published programs" on public.programs for select to anon, authenticated using (status = 'PUBLISHED');
create policy "Public can view website settings" on public.website_settings for select to anon, authenticated using (true);

-- Policies for Admins (Full Access)
create policy "Admins have full access to pages" on public.pages to authenticated using ((select private.has_active_admin_session()));
create policy "Admins have full access to programs" on public.programs to authenticated using ((select private.has_active_admin_session()));
create policy "Admins have full access to website settings" on public.website_settings to authenticated using ((select private.has_active_admin_session()));

-- Bypass RLS is not possible on standard authenticated, but since admin policy returns true for everything they do, they can bypass the "PUBLISHED" filter.
-- Actually for INSERT/UPDATE/DELETE, we need specific policies for admins.
create policy "Admins can insert pages" on public.pages for insert to authenticated with check ((select private.has_active_admin_session()));
create policy "Admins can update pages" on public.pages for update to authenticated using ((select private.has_active_admin_session())) with check ((select private.has_active_admin_session()));
create policy "Admins can delete pages" on public.pages for delete to authenticated using ((select private.has_active_admin_session()));

create policy "Admins can insert programs" on public.programs for insert to authenticated with check ((select private.has_active_admin_session()));
create policy "Admins can update programs" on public.programs for update to authenticated using ((select private.has_active_admin_session())) with check ((select private.has_active_admin_session()));
create policy "Admins can delete programs" on public.programs for delete to authenticated using ((select private.has_active_admin_session()));

create policy "Admins can insert website settings" on public.website_settings for insert to authenticated with check ((select private.has_active_admin_session()));
create policy "Admins can update website settings" on public.website_settings for update to authenticated using ((select private.has_active_admin_session())) with check ((select private.has_active_admin_session()));
create policy "Admins can delete website settings" on public.website_settings for delete to authenticated using ((select private.has_active_admin_session()));

-- Triggers for updated_at
create trigger pages_updated before update on public.pages for each row execute function private.touch_updated_at();
create trigger programs_updated before update on public.programs for each row execute function private.touch_updated_at();
create trigger website_settings_updated before update on public.website_settings for each row execute function private.touch_updated_at();

-- RPCs for Publish Logic
create function public.publish_page(p_id uuid)
returns void language plpgsql security definer set search_path='' as $$$
begin
 if not private.has_active_admin_session() then raise insufficient_privilege; end if;
 update public.pages set status = 'PUBLISHED', published_at = coalesce(published_at, statement_timestamp()) where id = p_id;
end;$$$;
grant execute on function public.publish_page(uuid) to authenticated;

create function public.publish_program(p_id uuid)
returns void language plpgsql security definer set search_path='' as $$$
begin
 if not private.has_active_admin_session() then raise insufficient_privilege; end if;
 update public.programs set status = 'PUBLISHED' where id = p_id;
end;$$$;
grant execute on function public.publish_program(uuid) to authenticated;

