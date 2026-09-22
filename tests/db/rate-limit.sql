begin;
do $$declare r jsonb;n integer;b bigint:=floor(extract(epoch from statement_timestamp())/60);begin
 -- An exhausted previous fixed bucket does not consume the current bucket.
 insert into private.rate_limit_counters values('boundary','media_signature',repeat('a',64),b-1,11,statement_timestamp()+interval '1 day');
 r:=public.consume_rate_limit('boundary','media_signature',repeat('a',64));
 if not (r->>'allowed')::boolean or (r->>'remaining')::int<>9 or (r->>'retry_after_seconds')::int<>greatest(1,ceil(extract(epoch from to_timestamp((b+1)*60)-statement_timestamp()))::int) then raise exception 'fixed bucket/retry-after incorrect';end if;
 for n in 1..31 loop r:=public.consume_rate_limit('ip','login_ip',repeat('b',64)); if (r->>'allowed')::boolean<>(n<=30) then raise exception 'IP quota incorrect';end if;end loop;
 insert into private.rate_limit_counters values('expired','login_ip',repeat('c',64),0,1,statement_timestamp()-interval '2 days'),('expired','login_ip',repeat('d',64),0,1,statement_timestamp()-interval '1 day');
 if private.cleanup_rate_limits(1)<>1 then raise exception 'cleanup batch incorrect';end if;
 if (select count(*) from private.rate_limit_counters where namespace='expired')<>1 or (select count(*) from private.rate_limit_counters where namespace='boundary')<>2 then raise exception 'cleanup crossed scope/expiry';end if;
end$$;
rollback;
