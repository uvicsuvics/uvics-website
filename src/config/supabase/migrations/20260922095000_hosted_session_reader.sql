-- Hosted schema auth is owned by supabase_admin. postgres can read sessions,
-- but cannot delegate schema USAGE to a new role. Keep the narrow predicate
-- under the migration/operator role; clients cannot call its arbitrary-ID form.
grant uvics_session_reader to postgres;
alter function private.admin_session_is_active(uuid,uuid) owner to postgres;
drop policy session_reader on public.admins;
revoke select(id,is_active) on public.admins from uvics_session_reader;
revoke select(id,user_id,created_at) on auth.sessions from uvics_session_reader;
revoke usage on schema auth,public,private from uvics_session_reader;
revoke uvics_session_reader from postgres;
drop role uvics_session_reader;
revoke all on function private.admin_session_is_active(uuid,uuid) from public,anon,authenticated,service_role;
