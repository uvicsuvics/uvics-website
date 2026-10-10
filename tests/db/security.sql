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
 ('internal_note','"private-sentinel"','00000000-0000-4000-8000-000000000001'),
 ('phone','"+6281234567890"','00000000-0000-4000-8000-000000000001'),
 ('logo','"/logo/uvics.png"','00000000-0000-4000-8000-000000000001'),
 ('linkedin_url','"https://www.linkedin.com/company/uvics"','00000000-0000-4000-8000-000000000001'),
 ('instagram_url','"javascript:alert(1)"','00000000-0000-4000-8000-000000000001'),
 ('github_url','"https://user:pass@github.com/uvics"','00000000-0000-4000-8000-000000000001'),
 ('favicon','"https://res.cloudinary.com/synthetic/image/authenticated/v1/uvics/pending/00000000-0000-4000-8000-000000000003.png"','00000000-0000-4000-8000-000000000001');

-- Guest: hanya reader settings allowlist dan konten PUBLISHED.
set local role anon;
do $$begin
 if public.read_public_settings()<>'{"organization_name":"UVICS","registration_open":true,"phone":"+6281234567890","logo":"/logo/uvics.png","linkedin_url":"https://www.linkedin.com/company/uvics"}'::jsonb then raise exception 'public settings allowlist mismatch';end if;
 begin perform key from public.website_settings;raise exception 'anon raw settings allowed';exception when insufficient_privilege then null;end;
 if (select count(*) from public.pages)<>1 or exists(select from public.programs) then raise exception 'anon draft leak';end if;
 begin perform public.publish_page('00000000-0000-4000-8000-000000000101');raise exception 'anon publish allowed';exception when insufficient_privilege then null;end;
 begin insert into public.pages(title,slug) values('x','anon-x');raise exception 'anon insert allowed';exception when insufficient_privilege then null;end;
end$$;
reset role;

-- Validasi per key di reader SQL: batas telepon (digit tanpa "+"), URL, dan aset branding.
do $$declare p record;begin
 for p in select * from (values
  ('phone','"+12345678"',true),('phone','"+1234567"',false),('phone','"+123456789012345"',true),('phone','"+1234567890123456"',false),
  ('phone','"08123456789"',false),('phone','"+62 812345678"',false),('phone','"+0812345678"',false),
  ('email','"admin@uvics.example"',true),('email','"not-an-email"',false),('email','"a b@uvics.example"',false),
  ('youtube_url','"https://youtube.com/@uvics"',true),('youtube_url','"ftp://youtube.com/uvics"',false),('youtube_url','"https://user@youtube.com"',false),
  ('logo','"https://res.cloudinary.com/synthetic/image/upload/c_limit,w_256/v1/uvics/published/00000000-0000-4000-8000-000000000004.png"',true),
  ('logo','"https://res.cloudinary.com/synthetic/image/upload/v1/uvics/pending/00000000-0000-4000-8000-000000000004.png"',false),
  ('logo','"/../secret.png"',false),('favicon','"javascript:alert(1)"',false),('favicon','"/favicon.ico"',true),
  ('organization_name','"   "',false),
  -- Pasangan reproduksi review: SQL tidak boleh lebih longgar daripada DTO.
  ('youtube_url','"https://example.org/path?x=1#y"',true),('youtube_url','"https://example.org:99999/path"',false),
  ('youtube_url','"https://uvics.123/"',false),
  ('youtube_url','"https://ab--c.example/x"',true),('youtube_url','"https://xn--a.example/x"',false),
  ('youtube_url','"https://XN--0.example/x"',false),('youtube_url','"https://www.xn--bcher-kva.example/x"',false),
  ('email','"a.b@uvics.example"',true),('email','"a..b@uvics.example"',false),
  ('organization_name','"UVICS Unklab"',true),('organization_name','"\t"',false)) v(key,value,allowed) loop
  begin
   insert into public.website_settings(key,value) values(p.key,p.value::jsonb) on conflict(key) do update set value=excluded.value;
   set local role anon;
   if (public.read_public_settings() ? p.key)<>p.allowed then raise exception 'settings validation mismatch %=%',p.key,p.value;end if;
   reset role;
   raise sqlstate 'P0003';
  exception when sqlstate 'P0003' then null;end;
 end loop;
end$$;

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
 if (select count(*) from public.website_settings)<>11 or (select count(*) from public.pages)<>2 then raise exception 'admin read denied';end if;
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

-- D13: service_role tidak boleh menulis langsung tabel domain (bypass audit); hanya SELECT.
do $$declare t text;p text;begin
 foreach t in array array['registrations','members','membership_histories','departments','positions','organization_periods',
  'pages','programs','website_settings','competitions','achievements','achievement_members','projects','project_members','achievement_certificates'] loop
  if not has_table_privilege('service_role','public.'||t,'SELECT') then raise exception 'service_role lost SELECT on %',t;end if;
  foreach p in array array['INSERT','UPDATE','DELETE','TRUNCATE'] loop
   if has_table_privilege('service_role','public.'||t,p) then raise exception 'service_role % on % bypasses audit',p,t;end if;
  end loop;
 end loop;
end$$;

-- Policy tulis yang tidak terpakai dihapus agar grant di masa depan tidak diam-diam membuka bypass audit.
do $$begin
 if exists(select from pg_policies where schemaname='public' and tablename in('pages','programs','website_settings') and cmd<>'SELECT')
  then raise exception 'dormant CMS write policy present';end if;
end$$;

-- D04: batas digit constraint SQL kanonis harus sama dengan PHONE_MIN_DIGITS/PHONE_MAX_DIGITS (8–15) di Zod.
do $$declare n int;ok boolean;begin
 foreach n in array array[7,8,15,16] loop
  begin
   insert into public.registrations(full_name,nim,email,phone,faculty,study_program,batch)
   values('Phone Bound','nim-phone-'||n,'phone'||n||'@example.invalid','+1'||repeat('2',n-1),'FIK','Informatika',2026);
   ok:=true;
  exception when check_violation then ok:=false;end;
  if ok<>(n between 8 and 15) then raise exception 'phone digit bound mismatch at %',n;end if;
 end loop;
end$$;
rollback;
