-- Issue #28: submission registration publik. Migration terapan tidak diubah.

-- Bukti persetujuan PRD §22.2. Nullable karena baris lama (seed/fixture, data sebelum #28)
-- tidak punya persetujuan; NOT NULL gagal saat migrate dan CHECK NOT VALID tetap dievaluasi
-- saat UPDATE sehingga memblokir review admin atas baris lama. submit_registration adalah
-- satu-satunya jalur insert dan selalu mengisinya.
alter table public.registrations add column consent_at timestamptz;

-- Batas angkatan statis: CHECK dengan now() hanya dievaluasi saat tulis sehingga maknanya
-- bergeser dan dapat gagal saat restore. Batas atas dinamis (tahun berjalan + 1) di Zod.
alter table public.registrations
  add constraint registrations_batch_range check (batch between 2000 and 2100),
  add constraint registrations_skills_length check (char_length(skills) <= 1000),
  add constraint registrations_experience_length check (char_length(experience) <= 1000),
  add constraint registrations_motivation_length check (char_length(motivation) <= 2000);

-- Satu registration aktif per NIM (U19). ACCEPTED yang belum dikonversi tetap aktif; setelah
-- konversi, NIM tertahan oleh pengecekan members di submit_registration.
create unique index registrations_one_active_per_nim on public.registrations (nim)
  where status in ('SUBMITTED', 'UNDER_REVIEW') or (status = 'ACCEPTED' and converted_member_id is null);

create or replace function public.consume_rate_limit(p_namespace text,p_operation text,p_subject_hash text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare quota int;window_seconds int;bucket_id bigint;used int;deadline timestamptz;clock_seconds numeric:=extract(epoch from statement_timestamp());
begin
 case p_operation when 'login_email_ip' then quota:=5;window_seconds:=900;
 when 'login_ip' then quota:=30;window_seconds:=900;
 when 'media_signature' then quota:=10;window_seconds:=60;
 when 'media_complete' then quota:=30;window_seconds:=60;
 when 'registration_email_ip' then quota:=5;window_seconds:=3600;
 when 'registration_ip' then quota:=60;window_seconds:=3600;
 else raise exception 'Unknown limiter operation' using errcode='22023';end case;
 bucket_id:=floor(clock_seconds/window_seconds)::bigint;deadline:=to_timestamp((bucket_id+1)*window_seconds);
 insert into private.rate_limit_counters(namespace,operation,subject_hash,bucket,hits,expires_at)
 values(p_namespace,p_operation,p_subject_hash,bucket_id,1,deadline+interval '1 day')
 on conflict(namespace,operation,subject_hash,bucket) do update set hits=least(private.rate_limit_counters.hits+1,quota+1)
 returning hits into used;
 return jsonb_build_object('allowed',used<=quota,'remaining',greatest(quota-used,0),'retry_after_seconds',greatest(1,ceil(extract(epoch from deadline-statement_timestamp()))::int));
end;$$;

-- Hanya server (service_role, setelah origin + limiter + Zod) yang boleh memanggil; tanpa ini
-- anon dapat melewati limiter dan validasi lewat Data API (ES §5).
create function public.submit_registration(
  p_full_name text, p_nim text, p_email text, p_phone text, p_faculty text, p_study_program text, p_batch integer,
  p_preferred_department_id uuid default null, p_skills text default null, p_experience text default null,
  p_motivation text default null, p_portfolio_url text default null)
returns text language plpgsql security definer set search_path='' as $$
begin
 if (select s.value from public.website_settings s where s.key = 'registration_open') is distinct from 'true'::jsonb then
  return 'CLOSED';
 end if;
 if p_preferred_department_id is not null and not exists (
  select from public.departments d where d.id = p_preferred_department_id and d.active) then
  return 'INVALID_DEPARTMENT';
 end if;
 -- Respons sama dengan duplikat agar status keanggotaan tidak terungkap (D02).
 if exists (select from public.members m where m.nim = p_nim) then
  return 'DUPLICATE';
 end if;
 begin
  insert into public.registrations(full_name, nim, email, phone, faculty, study_program, batch,
   preferred_department_id, skills, experience, motivation, portfolio_url, consent_at)
  values (p_full_name, p_nim, p_email, p_phone, p_faculty, p_study_program, p_batch,
   p_preferred_department_id, p_skills, p_experience, p_motivation, p_portfolio_url, statement_timestamp());
 exception when unique_violation then
  return 'DUPLICATE';
 end;
 return 'SUBMITTED';
end;$$;
revoke all on function public.submit_registration(text,text,text,text,text,text,integer,uuid,text,text,text,text) from public, anon, authenticated;
grant execute on function public.submit_registration(text,text,text,text,text,text,integer,uuid,text,text,text,text) to service_role;
