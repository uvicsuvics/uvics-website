-- Issue #31: principal allow/deny, audit context, rollback, dan privasi CMS/settings.
begin;
insert into auth.users values('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
insert into public.admins(id,name,is_active) values('00000000-0000-4000-8000-000000000001','Synthetic admin',true);
insert into auth.sessions values
 ('00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000001',statement_timestamp()),
 ('00000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000001',statement_timestamp()-interval '2 hours');
insert into public.pages(id,title,slug,status) values
 ('00000000-0000-4000-8000-000000000101','Draft sentinel','draft-sentinel','DRAFT'),
 ('00000000-0000-4000-8000-000000000102','Published','published','PUBLISHED');
insert into public.programs(id,name,slug,status) values
 ('00000000-0000-4000-8000-000000000201','Draft program','draft-program','DRAFT'),
 ('00000000-0000-4000-8000-000000000202','Rollback program','rollback-program','DRAFT');
insert into public.website_settings(key,value,updated_by) values
 ('organization_name','"UVICS"','00000000-0000-4000-8000-000000000001'),
 ('registration_open','true','00000000-0000-4000-8000-000000000001'),
 ('maintenance_mode','"true"','00000000-0000-4000-8000-000000000001'),
 ('email','{"private":"sentinel"}','00000000-0000-4000-8000-000000000001'),
 ('internal_note','"private-sentinel"','00000000-0000-4000-8000-000000000001');

-- Guest: hanya reader settings allowlist dan konten PUBLISHED.
set local role anon;
do $$begin
 if public.read_public_settings()<>'{"organization_name":"UVICS","registration_open":true}'::jsonb then raise exception 'public settings allowlist mismatch';end if;
 begin perform key from public.website_settings;raise exception 'anon raw settings allowed';exception when insufficient_privilege then null;end;
 if (select count(*) from public.pages)<>1 or exists(select from public.programs) then raise exception 'anon draft leak';end if;
 begin perform public.publish_page('00000000-0000-4000-8000-000000000101');raise exception 'anon publish allowed';exception when insufficient_privilege then null;end;
 begin insert into public.pages(title,slug) values('x','anon-x');raise exception 'anon insert allowed';exception when insufficient_privilege then null;end;
end$$;
reset role;

-- Non-admin, sesi kedaluwarsa, sesi dicabut, dan admin nonaktif ditolak di RPC.
do $$declare claims text;begin
 foreach claims in array array[
  '{"sub":"00000000-0000-4000-8000-000000000002","session_id":"00000000-0000-4000-8000-000000000011"}',
  '{"sub":"00000000-0000-4000-8000-000000000001","session_id":"00000000-0000-4000-8000-000000000012"}',
  '{"sub":"00000000-0000-4000-8000-000000000001","session_id":"00000000-0000-4000-8000-000000000099"}'] loop
  perform set_config('request.jwt.claims',claims,true);
  set local role authenticated;
  if exists(select from public.website_settings) or exists(select from public.programs) then raise exception 'non-admin raw read leak';end if;
  begin perform public.publish_page('00000000-0000-4000-8000-000000000101');raise exception 'unauthorized publish allowed';exception when insufficient_privilege then null;end;
  reset role;
 end loop;
 perform set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","session_id":"00000000-0000-4000-8000-000000000011"}',true);
 update public.admins set is_active=false;
 set local role authenticated;
 begin perform public.publish_program('00000000-0000-4000-8000-000000000201');raise exception 'inactive admin publish allowed';exception when insufficient_privilege then null;end;
 reset role;
 update public.admins set is_active=true;
end$$;

-- Active admin: raw read diizinkan, DML langsung ditolak, publish tercatat atomik.
set local role authenticated;
do $$declare a public.audit_logs;begin
 if (select count(*) from public.website_settings)<>5 or (select count(*) from public.pages)<>2 then raise exception 'admin read denied';end if;
 begin insert into public.pages(title,slug) values('x','direct-x');raise exception 'direct page insert allowed';exception when insufficient_privilege then null;end;
 begin update public.pages set status='PUBLISHED';raise exception 'direct page update allowed';exception when insufficient_privilege then null;end;
 begin delete from public.programs;raise exception 'direct program delete allowed';exception when insufficient_privilege then null;end;
 begin update public.website_settings set value='false' where key='registration_open';raise exception 'direct settings update allowed';exception when insufficient_privilege then null;end;
 begin perform private.write_audit('00000000-0000-4000-8000-000000000001','FORGED','page',null,'{}','{}');raise exception 'client audit write allowed';exception when insufficient_privilege then null;end;
 perform public.publish_page('00000000-0000-4000-8000-000000000101');
 perform public.publish_page('00000000-0000-4000-8000-000000000101');
 if (select status from public.pages where id='00000000-0000-4000-8000-000000000101')<>'PUBLISHED' then raise exception 'publish failed';end if;
 select * into strict a from public.audit_logs where action='PAGE_PUBLISHED';
 if a.actor_id<>'00000000-0000-4000-8000-000000000001' or a.session_id is distinct from '00000000-0000-4000-8000-000000000011'
  or a.entity_id<>'00000000-0000-4000-8000-000000000101' or a.old_values<>'{"status":"DRAFT"}' or a.new_values<>'{"status":"PUBLISHED"}'
  or a.created_at>statement_timestamp() then raise exception 'publish audit context mismatch';end if;
 begin perform public.publish_program(gen_random_uuid());raise exception 'missing program reported success';exception when no_data_found then null;end;
end$$;
reset role;

-- Writer audit memvalidasi actor/session sendiri, bukan percaya caller.
do $$begin
 begin perform private.write_audit('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000012','FIXTURE','fixture',null,'{}','{}');raise exception 'expired audit context allowed';exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000002","session_id":"00000000-0000-4000-8000-000000000011"}',true);
 begin perform private.write_audit('00000000-0000-4000-8000-000000000001','FIXTURE','fixture',null,'{}','{}');raise exception 'forged audit actor allowed';exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","session_id":"00000000-0000-4000-8000-000000000011"}',true);
end$$;

-- Audit gagal membatalkan mutation publish.
create function public.fail_audit_fixture() returns trigger language plpgsql as $$begin raise exception 'audit fixture failure';end$$;
create trigger fail_audit_fixture before insert on public.audit_logs for each row execute function public.fail_audit_fixture();
set local role authenticated;
do $$begin
 begin perform public.publish_program('00000000-0000-4000-8000-000000000202');raise exception 'publish without audit succeeded';
 exception when raise_exception then if sqlerrm<>'audit fixture failure' then raise;end if;end;
end$$;
reset role;
drop trigger fail_audit_fixture on public.audit_logs;
do $$begin
 if (select status from public.programs where id='00000000-0000-4000-8000-000000000202')<>'DRAFT'
  or exists(select from public.audit_logs where action='PROGRAM_PUBLISHED') then raise exception 'publish not atomic with audit';end if;
end$$;
rollback;
