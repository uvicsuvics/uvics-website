-- Issue #31 (D01, D13): tutup sisa jalur tulis yang melewati audit. Migration terapan tidak diubah.

-- service_role melewati RLS. DML langsung pada tabel domain berarti mutation tanpa audit;
-- seeder memakai owner database (psql) dan runtime hanya memanggil RPC limiter/media.
revoke all on public.registrations,public.members,public.membership_histories,
  public.departments,public.positions,public.organization_periods,
  public.competitions,public.achievements,public.achievement_members,
  public.projects,public.project_members,public.achievement_certificates from service_role;
grant select on public.registrations,public.members,public.membership_histories,
  public.departments,public.positions,public.organization_periods,
  public.competitions,public.achievements,public.achievement_members,
  public.projects,public.project_members,public.achievement_certificates to service_role;

-- Policy write CMS tidak efektif sejak grant dicabut (20261008100000), tetapi akan
-- membuka bypass audit begitu ada grant baru. Admin read diganti policy SELECT-only.
drop policy "Admins can insert pages" on public.pages;
drop policy "Admins can update pages" on public.pages;
drop policy "Admins can delete pages" on public.pages;
drop policy "Admins have full access to pages" on public.pages;
drop policy "Admins can insert programs" on public.programs;
drop policy "Admins can update programs" on public.programs;
drop policy "Admins can delete programs" on public.programs;
drop policy "Admins have full access to programs" on public.programs;
drop policy "Admins can insert website settings" on public.website_settings;
drop policy "Admins can update website settings" on public.website_settings;
drop policy "Admins can delete website settings" on public.website_settings;
drop policy "Admins have full access to website settings" on public.website_settings;
create policy active_admin_read on public.pages for select to authenticated using ((select private.has_active_admin_session()));
create policy active_admin_read on public.programs for select to authenticated using ((select private.has_active_admin_session()));
create policy active_admin_read on public.website_settings for select to authenticated using ((select private.has_active_admin_session()));
