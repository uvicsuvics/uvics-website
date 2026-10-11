-- Additive foundation. Never modify Auth-owned tables or insert Auth identities.
create schema if not exists private;
revoke all on schema private from public,anon,authenticated;
grant usage on schema private to authenticated,service_role;

create table public.admins (
 id uuid primary key references auth.users(id) on delete restrict,
 name text not null check(char_length(name) between 1 and 120),
 is_active boolean not null default false,
 created_at timestamptz not null default statement_timestamp(),
 updated_at timestamptz not null default statement_timestamp(),
 last_login_at timestamptz
);
alter table public.admins enable row level security;
revoke all on public.admins from public,anon,authenticated;
grant select on public.admins to authenticated;
grant select,insert,update,delete on public.admins to service_role;

-- Dedicated NOLOGIN reader has only the columns needed by the predicate.
create role uvics_session_reader nologin noinherit;
grant uvics_session_reader to postgres;
grant usage on schema auth,public,private to uvics_session_reader;
grant select(id,user_id,created_at) on auth.sessions to uvics_session_reader;
grant select(id,is_active) on public.admins to uvics_session_reader;
create policy session_reader on public.admins for select to uvics_session_reader using(true);
create function private.admin_session_is_active(p_user uuid,p_session uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.admins a join auth.sessions s on s.user_id=a.id
 where a.id=p_user and a.is_active and s.id=p_session
 and s.created_at<=statement_timestamp() and statement_timestamp()<s.created_at+interval '1 hour');
$$;
grant create on schema private to uvics_session_reader;
alter function private.admin_session_is_active(uuid,uuid) owner to uvics_session_reader;
revoke create on schema private from uvics_session_reader;
revoke all on function private.admin_session_is_active(uuid,uuid) from public,anon,authenticated;
grant execute on function private.admin_session_is_active(uuid,uuid) to postgres;
revoke uvics_session_reader from postgres;

create function private.has_active_admin_session() returns boolean
language plpgsql stable security definer set search_path='' as $$
declare s uuid;u uuid;
begin
 begin s:=(auth.jwt()->>'session_id')::uuid;u:=auth.uid();
 exception when invalid_text_representation then return false;end;
 if s is null or u is null then return false;end if;
 return private.admin_session_is_active(u,s);
end;$$;
revoke all on function private.has_active_admin_session() from public,anon;
grant execute on function private.has_active_admin_session() to authenticated;
create function public.has_active_admin_session() returns boolean
language sql stable security invoker set search_path='' as $$select private.has_active_admin_session()$$;
revoke all on function public.has_active_admin_session() from public,anon;
grant execute on function public.has_active_admin_session() to authenticated;
create policy active_admin_read on public.admins for select to authenticated using((select private.has_active_admin_session()));

create function private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at:=statement_timestamp();return new;end;$$;
revoke all on function private.touch_updated_at() from public,anon,authenticated;
create trigger admins_updated before update on public.admins for each row execute function private.touch_updated_at();

create table public.audit_logs (
 id uuid primary key default gen_random_uuid(),
 actor_id uuid references public.admins(id) on delete set null,
 action text not null check(char_length(action) between 1 and 80),
 entity_type text not null check(char_length(entity_type) between 1 and 80),
 entity_id uuid,
 old_values jsonb not null default '{}',new_values jsonb not null default '{}',
 session_id uuid,
 created_at timestamptz not null default statement_timestamp(),
 check(jsonb_typeof(old_values)='object' and jsonb_typeof(new_values)='object'),
 check(octet_length(old_values::text)<=8192 and octet_length(new_values::text)<=8192)
);
create index audit_logs_created on public.audit_logs(created_at desc,id desc);
create index audit_logs_actor on public.audit_logs(actor_id,created_at desc);
create unique index audit_login_once on public.audit_logs(session_id) where action='ADMIN_LOGIN';
alter table public.audit_logs enable row level security;
revoke all on public.audit_logs from public,anon,authenticated;
grant select on public.audit_logs to authenticated;
grant select on public.audit_logs to service_role;
create policy active_admin_audit_read on public.audit_logs for select to authenticated using((select private.has_active_admin_session()));
create function private.write_audit(p_actor uuid,p_action text,p_entity_type text,p_entity_id uuid,p_old jsonb,p_new jsonb)
returns uuid language plpgsql security invoker set search_path='' as $$
declare result uuid;
begin
 insert into public.audit_logs(actor_id,action,entity_type,entity_id,old_values,new_values)
 values(p_actor,p_action,p_entity_type,p_entity_id,p_old,p_new) returning id into result;return result;
end;$$;
revoke all on function private.write_audit(uuid,text,text,uuid,jsonb,jsonb) from public,anon,authenticated,service_role;
create function public.record_admin_login() returns void language plpgsql security definer set search_path='' as $$
declare inserted uuid;
begin
 if not private.has_active_admin_session() then raise insufficient_privilege;end if;
 insert into public.audit_logs(actor_id,action,entity_type,entity_id,session_id)
 values(auth.uid(),'ADMIN_LOGIN','admin',auth.uid(),(auth.jwt()->>'session_id')::uuid)
 on conflict(session_id) where action='ADMIN_LOGIN' do nothing returning id into inserted;
 if inserted is not null then update public.admins set last_login_at=statement_timestamp() where id=auth.uid();end if;
end;$$;
revoke all on function public.record_admin_login() from public,anon;
grant execute on function public.record_admin_login() to authenticated;

create table private.rate_limit_counters (
 namespace text not null,operation text not null,subject_hash text not null,
 bucket bigint not null,hits integer not null check(hits>0),expires_at timestamptz not null,
 primary key(namespace,operation,subject_hash,bucket),
 check(namespace ~ '^[a-zA-Z0-9_-]{1,80}$'),check(subject_hash ~ '^[a-f0-9]{64}$')
);
revoke all on private.rate_limit_counters from public,anon,authenticated,service_role;
create index rate_limit_expiry on private.rate_limit_counters(expires_at);
create function public.consume_rate_limit(p_namespace text,p_operation text,p_subject_hash text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare quota int;window_seconds int;bucket_id bigint;used int;deadline timestamptz;clock_seconds numeric:=extract(epoch from statement_timestamp());
begin
 case p_operation when 'login_email_ip' then quota:=5;window_seconds:=900;
 when 'login_ip' then quota:=30;window_seconds:=900;
 when 'media_signature' then quota:=10;window_seconds:=60;
 when 'media_complete' then quota:=30;window_seconds:=60;
 else raise exception 'Unknown limiter operation' using errcode='22023';end case;
 bucket_id:=floor(clock_seconds/window_seconds)::bigint;deadline:=to_timestamp((bucket_id+1)*window_seconds);
 insert into private.rate_limit_counters(namespace,operation,subject_hash,bucket,hits,expires_at)
 values(p_namespace,p_operation,p_subject_hash,bucket_id,1,deadline+interval '1 day')
 on conflict(namespace,operation,subject_hash,bucket) do update set hits=least(private.rate_limit_counters.hits+1,quota+1)
 returning hits into used;
 return jsonb_build_object('allowed',used<=quota,'remaining',greatest(quota-used,0),'retry_after_seconds',greatest(1,ceil(extract(epoch from deadline-statement_timestamp()))::int));
end;$$;
revoke all on function public.consume_rate_limit(text,text,text) from public,anon,authenticated;
grant execute on function public.consume_rate_limit(text,text,text) to service_role;
create function private.cleanup_rate_limits(p_batch integer default 1000) returns integer
language plpgsql security definer set search_path='' as $$declare removed integer;begin
 if p_batch<1 or p_batch>5000 then raise exception 'Invalid batch' using errcode='22023';end if;
 with expired as(select ctid from private.rate_limit_counters where expires_at<statement_timestamp() order by expires_at limit p_batch for update skip locked)
 delete from private.rate_limit_counters where ctid in(select ctid from expired);get diagnostics removed=row_count;return removed;
end;$$;
revoke all on function private.cleanup_rate_limits(integer) from public,anon,authenticated,service_role;

create table private.upload_intents (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.admins(id) on delete restrict,
 category text not null check(category in('profile','poster','thumbnail','gallery','certificate','document')),
 kind text not null check(kind in('image','pdf')),
 public_id text not null unique,
 resource_type text not null default 'image' check(resource_type='image'),
 delivery_type text not null default 'authenticated' check(delivery_type='authenticated'),
 preset text not null,max_bytes integer not null,
 issued_at timestamptz not null default date_trunc('second',statement_timestamp()),
 expires_at timestamptz not null,cleanup_not_before timestamptz not null,
 status text not null default 'PENDING' check(status in('PENDING','COMPLETED','REJECTED','EXPIRED')),
 asset_id text unique,version bigint,format text,bytes bigint,width integer,height integer,
 publication_status text not null default 'PRIVATE' check(publication_status in('PRIVATE','PUBLISHING','PUBLIC','FAILED')),
 published_public_id text unique,published_asset_id text unique,published_version bigint,
 reference_type text,reference_id uuid,
 cleanup_status text not null default 'HELD' check(cleanup_status in('HELD','READY','CLEANED')),
 created_at timestamptz not null default statement_timestamp(),updated_at timestamptz not null default statement_timestamp(),
 check(expires_at=issued_at+interval '1 hour'),check(cleanup_not_before>=issued_at+interval '65 minutes'),
 check((kind='pdf' and category in('certificate','document')) or (kind='image' and category<>'document')),
 check((status='COMPLETED')=(asset_id is not null)),
 check(publication_status<>'PUBLIC' or (published_asset_id is not null and published_version is not null))
);
create index upload_intent_owner on private.upload_intents(owner_id,created_at desc);
create index upload_intent_cleanup on private.upload_intents(cleanup_not_before) where cleanup_status<>'CLEANED';
revoke all on private.upload_intents from public,anon,authenticated,service_role;
create trigger intents_updated before update on private.upload_intents for each row execute function private.touch_updated_at();

-- Media RPCs are server-only. Actor/session come from a verified user client,
-- never request body. The database rechecks them at the mutation boundary.
create function public.create_upload_intent(p_actor uuid,p_session uuid,p_category text,p_kind text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r private.upload_intents;mb int;identifier uuid:=gen_random_uuid();t timestamptz:=date_trunc('second',statement_timestamp());
begin
 if not private.admin_session_is_active(p_actor,p_session) then raise insufficient_privilege;end if;
 mb:=case when p_kind='pdf' then 10 when p_category='profile' then 2 else 5 end;
 insert into private.upload_intents(id,owner_id,category,kind,public_id,preset,max_bytes,issued_at,expires_at,cleanup_not_before)
 values(identifier,p_actor,p_category,p_kind,'uvics/pending/'||identifier,'uvics_'||p_kind||'_'||mb||'mb_v1',mb*1048576,t,t+interval '1 hour',t+interval '65 minutes') returning * into r;
 return to_jsonb(r);
end;$$;
create function public.read_upload_intent(p_actor uuid,p_session uuid,p_intent uuid)
returns jsonb language plpgsql security definer set search_path='' as $$declare r private.upload_intents;begin
 if not private.admin_session_is_active(p_actor,p_session) then raise insufficient_privilege;end if;
 select * into r from private.upload_intents where id=p_intent and owner_id=p_actor;
 if not found then raise no_data_found;end if;return to_jsonb(r);
end;$$;
create function public.complete_upload_intent(p_actor uuid,p_session uuid,p_intent uuid,p_asset_id text,p_version bigint,p_format text,p_bytes bigint,p_width integer,p_height integer)
returns jsonb language plpgsql security definer set search_path='' as $$declare r private.upload_intents;begin
 select * into r from private.upload_intents where id=p_intent and owner_id=p_actor for update;
 if not found then raise no_data_found;end if;
 if not private.admin_session_is_active(p_actor,p_session) then raise insufficient_privilege;end if;
 if r.status='COMPLETED' then
  if r.asset_id=p_asset_id and r.version=p_version then return to_jsonb(r);end if;
  raise exception 'Completion conflict';
 end if;
 if r.status<>'PENDING' then raise exception 'Intent closed';end if;
 if statement_timestamp()>=r.expires_at then
  update private.upload_intents set status='EXPIRED' where id=r.id returning * into r;return to_jsonb(r);
 end if;
 if p_bytes<=0 or p_bytes>r.max_bytes or p_version<=0 or char_length(p_asset_id) not between 1 and 128
 or (r.kind='pdf' and p_format<>'pdf') or (r.kind='image' and p_format not in('jpg','png','webp')) then
  update private.upload_intents set status='REJECTED' where id=r.id returning * into r;return to_jsonb(r);
 end if;
 update private.upload_intents set status='COMPLETED',asset_id=p_asset_id,version=p_version,format=p_format,bytes=p_bytes,width=p_width,height=p_height where id=r.id returning * into r;
 perform private.write_audit(p_actor,'MEDIA_COMPLETED','upload_intent',r.id,'{}',jsonb_build_object('category',r.category,'kind',r.kind));
 return to_jsonb(r);
end;$$;
create function public.reject_upload_intent(p_actor uuid,p_session uuid,p_intent uuid)
returns void language plpgsql security definer set search_path='' as $$begin
 if not private.admin_session_is_active(p_actor,p_session) then raise insufficient_privilege;end if;
 update private.upload_intents set status=case when statement_timestamp()>=expires_at then 'EXPIRED' else 'REJECTED' end where id=p_intent and owner_id=p_actor and status='PENDING';
end;$$;
revoke all on function public.create_upload_intent(uuid,uuid,text,text),public.read_upload_intent(uuid,uuid,uuid),public.complete_upload_intent(uuid,uuid,uuid,text,bigint,text,bigint,integer,integer),public.reject_upload_intent(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.create_upload_intent(uuid,uuid,text,text),public.read_upload_intent(uuid,uuid,uuid),public.complete_upload_intent(uuid,uuid,uuid,text,bigint,text,bigint,integer,integer),public.reject_upload_intent(uuid,uuid,uuid) to service_role;
