begin;
do $$begin if to_regprocedure('public.has_active_admin_session()') is null then raise exception 'session predicate missing';end if;end$$;
insert into auth.users values('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
insert into public.admins(id,name,is_active) values('00000000-0000-4000-8000-000000000001','Synthetic admin',true);
-- now() is transaction-stable, so exact deadline is tested in one DO statement.
do $$
declare u uuid:='00000000-0000-4000-8000-000000000001';s uuid:='00000000-0000-4000-8000-000000000011';t timestamptz:=statement_timestamp();
begin
 perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'session_id',s)::text,true);
 insert into auth.sessions values(s,u,t-interval '59 minutes 59 seconds');
 if not private.has_active_admin_session() then raise exception 'before deadline denied';end if;
 update auth.sessions set created_at=t-interval '1 hour' where id=s;
 if private.has_active_admin_session() then raise exception 'exact deadline allowed';end if;
 update auth.sessions set created_at=t-interval '1 hour 1 second' where id=s;
 if private.has_active_admin_session() then raise exception 'after deadline allowed';end if;
 update auth.sessions set created_at=t+interval '1 second' where id=s;
 if private.has_active_admin_session() then raise exception 'future session allowed';end if;
 update auth.sessions set created_at=t where id=s;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'session_id','bad')::text,true);
 if private.has_active_admin_session() then raise exception 'malformed session allowed';end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'session_id',s)::text,true);
end$$;
set local role authenticated;
do $$begin
 if not public.has_active_admin_session() then raise exception 'active admin denied';end if;
 if (select count(*) from public.admins)<>1 then raise exception 'admin RLS mismatch';end if;
 begin insert into public.admins(id,name) values('00000000-0000-4000-8000-000000000002','promotion');raise exception 'self promotion allowed';exception when insufficient_privilege then null;end;
 begin perform public.consume_rate_limit('forged','login_ip',repeat('a',64));raise exception 'client limiter allowed';exception when insufficient_privilege then null;end;
 perform public.record_admin_login();perform public.record_admin_login();
 if (select count(*) from public.audit_logs where action='ADMIN_LOGIN')<>1 then raise exception 'login audit not idempotent';end if;
 begin delete from public.audit_logs;raise exception 'client audit delete allowed';exception when insufficient_privilege then null;end;
end$$;
reset role;
update public.admins set is_active=false;
set local role authenticated;
do $$begin if public.has_active_admin_session() or exists(select from public.admins) then raise exception 'inactive admin allowed';end if;end$$;
reset role;
update public.admins set is_active=true;
delete from auth.sessions;
set local role authenticated;
do $$begin if public.has_active_admin_session() then raise exception 'revoked session allowed';end if;end$$;
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000002"}',true);
set local role authenticated;
do $$begin if exists(select from public.admins) or exists(select from public.audit_logs) then raise exception 'nonadmin leak';end if;end$$;
reset role;
set local role anon;
do $$begin
 begin perform public.has_active_admin_session();raise exception 'anon RPC allowed';exception when insufficient_privilege then null;end;
 begin perform id from public.admins;raise exception 'anon table allowed';exception when insufficient_privilege then null;end;
end$$;
reset role;
-- Audit and mutation use the same transaction, including exception rollback.
do $$declare before_count int;begin
 select count(*) into before_count from public.audit_logs;
 begin
  update public.admins set name='rollback';
  perform private.write_audit('00000000-0000-4000-8000-000000000001','FIXTURE','fixture',null,'{}','{}');
  raise exception 'rollback fixture';
 exception when raise_exception then null;end;
 if exists(select from public.admins where name='rollback') or (select count(*) from public.audit_logs)<>before_count then raise exception 'audit not atomic';end if;
end$$;
rollback;
