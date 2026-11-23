-- Default privileges Supabase hosted memberi ALL ke service_role pada tabel baru di public, sedangkan
-- 20260922090000 hanya mencabut dari public, anon, authenticated. Tutup sisa jalur tulis service_role:
-- audit_logs hanya ditulis private.write_audit (D13); admins tetap DML provisioning tanpa TRUNCATE.
revoke all on public.audit_logs from service_role;
grant select on public.audit_logs to service_role;
revoke all on public.admins from service_role;
grant select,insert,update,delete on public.admins to service_role;
