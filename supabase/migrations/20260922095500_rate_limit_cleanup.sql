-- Supabase includes pg_cron. Vanilla disposable PostgreSQL may not have it.
do $schedule$
begin
 if exists(select from pg_available_extensions where name='pg_cron') then
  create extension if not exists pg_cron with schema pg_catalog;
  perform cron.schedule('uvics-rate-limit-cleanup','*/15 * * * *','select private.cleanup_rate_limits(1000);');
 else
  raise notice 'pg_cron unavailable: verify hosted schedule separately';
 end if;
end $schedule$;
