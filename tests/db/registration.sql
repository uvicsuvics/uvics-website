-- Issue #28: submission registration publik lewat RPC khusus server.
begin;
select set_config('reg.users_before', (select count(*) from auth.users)::text, true);
insert into public.departments(id,name,slug,active) values
 ('00000000-0000-4000-8000-000000002801','Reg Aktif','reg-aktif',true),
 ('00000000-0000-4000-8000-000000002802','Reg Nonaktif','reg-nonaktif',false);
insert into public.members(full_name,nim) values('Member Lama','105021800001');
insert into public.website_settings(key,value) values('registration_open','false')
 on conflict(key) do update set value=excluded.value;

-- Helper test-only (ikut rollback); security invoker sehingga memakai role pemanggil.
create function public.test_reg_submit(p_nim text,p_dept uuid default null) returns text language sql as $$
 select public.submit_registration(p_full_name=>'Calon '||p_nim,p_nim=>p_nim,p_email=>p_nim||'@student.unklab.ac.id',
  p_phone=>'+6281234567890',p_faculty=>'FIK',p_study_program=>'Informatika',p_batch=>2026,
  p_preferred_department_id=>p_dept,p_skills=>'SQL',p_experience=>null,p_motivation=>'Belajar',p_portfolio_url=>'https://example.invalid/p')
$$;

set local role service_role;
do $$begin if public.test_reg_submit('105021800010')<>'CLOSED' then raise exception 'closed rejected: false';end if;end$$;
reset role;
delete from public.website_settings where key='registration_open';
set local role service_role;
do $$begin if public.test_reg_submit('105021800010')<>'CLOSED' then raise exception 'closed rejected: missing';end if;end$$;
reset role;
insert into public.website_settings(key,value) values('registration_open','"true"');
set local role service_role;
do $$begin
 if public.test_reg_submit('105021800010')<>'CLOSED' then raise exception 'closed rejected: string';end if;
 if exists(select from public.registrations where nim='105021800010') then raise exception 'closed rejected: row stored';end if;
end$$;
reset role;
update public.website_settings set value='true' where key='registration_open';

set local role service_role;
do $$declare r public.registrations;begin
 if public.test_reg_submit('105021800010')<>'SUBMITTED' then raise exception 'valid stored: status';end if;
 select * into r from public.registrations where nim='105021800010';
 if r.status<>'SUBMITTED' or r.consent_at is null or r.admin_notes is not null then raise exception 'valid stored: row';end if;
 if public.test_reg_submit('105021800010')<>'DUPLICATE'
  or (select count(*) from public.registrations where nim='105021800010')<>1 then raise exception 'second active registration for same NIM';end if;
end$$;
reset role;
update public.registrations set status='ACCEPTED' where nim='105021800010';
set local role service_role;
do $$begin if public.test_reg_submit('105021800010')<>'DUPLICATE' then raise exception 'accepted unconverted blocks reapply';end if;end$$;
reset role;
update public.registrations set status='REJECTED' where nim='105021800010';
set local role service_role;
do $$declare r public.registrations;begin
 if public.test_reg_submit('105021800010')<>'SUBMITTED' then raise exception 'rejected may reapply';end if;
 if public.submit_registration(p_full_name=>'Calon Minimal',p_nim=>'105021800011',p_email=>'minimal@student.unklab.ac.id',
   p_phone=>'+6281234567891',p_faculty=>'FIK',p_study_program=>'Informatika',p_batch=>2026)<>'SUBMITTED' then raise exception 'optional args default: status';end if;
 select * into r from public.registrations where nim='105021800011';
 if r.preferred_department_id is not null or r.skills is not null or r.experience is not null or r.motivation is not null or r.portfolio_url is not null
  then raise exception 'optional args default: columns';end if;
 if public.test_reg_submit('105021800001')<>'DUPLICATE' then raise exception 'member NIM hidden as duplicate';end if;
 if public.test_reg_submit('105021800012','00000000-0000-4000-8000-000000002802')<>'INVALID_DEPARTMENT'
  or public.test_reg_submit('105021800012','00000000-0000-4000-8000-0000000028ff')<>'INVALID_DEPARTMENT' then raise exception 'inactive department';end if;
 if public.test_reg_submit('105021800012','00000000-0000-4000-8000-000000002801')<>'SUBMITTED' then raise exception 'active department accepted';end if;
end$$;
reset role;

-- Batas teks dan angkatan ditegakkan juga untuk jalur tulis selain RPC.
do $$declare v record;begin
 for v in select * from (values (2026,repeat('x',2001),null::text),(1999,null,null),(2101,null,null),(2026,null,repeat('x',1001))) t(batch,motivation,skills) loop
  begin
   insert into public.registrations(full_name,nim,email,phone,faculty,study_program,batch,motivation,skills)
   values('Bound','105021800099','bound@student.unklab.ac.id','+6281234567899','FIK','Informatika',v.batch,v.motivation,v.skills);
   raise exception 'text bounds: accepted batch % ',v.batch;
  exception when check_violation then null;end;
 end loop;
 if (select count(*) from auth.users)<>current_setting('reg.users_before')::int then raise exception 'no auth user';end if;
end$$;

set local role anon;
do $$begin
 begin perform public.submit_registration(p_full_name=>'X',p_nim=>'105021800020',p_email=>'x@student.unklab.ac.id',p_phone=>'+6281234567892',
   p_faculty=>'FIK',p_study_program=>'Informatika',p_batch=>2026);raise exception 'anon cannot submit';
 exception when insufficient_privilege then null;end;
 begin insert into public.registrations(full_name,nim,email,phone,faculty,study_program,batch)
   values('X','105021800021','y@student.unklab.ac.id','+6281234567893','FIK','Informatika',2026);raise exception 'anon cannot insert';
 exception when insufficient_privilege then null;end;
end$$;
reset role;
set local role authenticated;
do $$begin
 begin perform public.submit_registration(p_full_name=>'X',p_nim=>'105021800022',p_email=>'z@student.unklab.ac.id',p_phone=>'+6281234567894',
   p_faculty=>'FIK',p_study_program=>'Informatika',p_batch=>2026);raise exception 'authenticated cannot submit';
 exception when insufficient_privilege then null;end;
end$$;
reset role;

do $$declare n int;allowed int;begin
 allowed:=0;for n in 1..6 loop allowed:=allowed+((public.consume_rate_limit('reg','registration_email_ip',repeat('e',64))->>'allowed')::boolean)::int;end loop;
 if allowed<>5 then raise exception 'registration quotas: email_ip %',allowed;end if;
 allowed:=0;for n in 1..61 loop allowed:=allowed+((public.consume_rate_limit('reg','registration_ip',repeat('f',64))->>'allowed')::boolean)::int;end loop;
 if allowed<>60 then raise exception 'registration quotas: ip %',allowed;end if;
 allowed:=0;for n in 1..6 loop allowed:=allowed+((public.consume_rate_limit('reg','login_email_ip',repeat('a',64))->>'allowed')::boolean)::int;end loop;
 if allowed<>5 then raise exception 'existing quotas unchanged';end if;
end$$;
rollback;
