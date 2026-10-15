-- Issue #31: guardrail keamanan additive. Migration terapan tidak diubah.

-- Audit context. Writer tujuh argumen memvalidasi ulang actor+session di database
-- sebelum menulis, sehingga service RPC tidak meneruskan context yang belum sah.
create function private.write_audit(p_actor uuid,p_session uuid,p_action text,p_entity_type text,p_entity_id uuid,p_old jsonb,p_new jsonb)
returns uuid language plpgsql security invoker set search_path='' as $$
declare result uuid;
begin
 if not private.admin_session_is_active(p_actor,p_session) then raise insufficient_privilege;end if;
 insert into public.audit_logs(actor_id,action,entity_type,entity_id,old_values,new_values,session_id)
 values(p_actor,p_action,p_entity_type,p_entity_id,p_old,p_new,p_session) returning id into result;
 return result;
end;$$;
revoke all on function private.write_audit(uuid,uuid,text,text,uuid,jsonb,jsonb) from public,anon,authenticated,service_role;

-- Writer enam argumen tetap untuk RPC sesi pengguna: actor wajib auth.uid() dan
-- session diambil dari JWT, bukan dari argumen caller.
create or replace function private.write_audit(p_actor uuid,p_action text,p_entity_type text,p_entity_id uuid,p_old jsonb,p_new jsonb)
returns uuid language plpgsql security invoker set search_path='' as $$
declare s uuid;
begin
 begin s:=(auth.jwt()->>'session_id')::uuid;
 exception when invalid_text_representation then raise insufficient_privilege;end;
 if p_actor is distinct from auth.uid() then raise insufficient_privilege;end if;
 return private.write_audit(p_actor,s,p_action,p_entity_type,p_entity_id,p_old,p_new);
end;$$;

-- Media service RPC: body sama dengan 20260922103000, hanya audit membawa session.
create or replace function public.complete_upload_intent(p_actor uuid,p_session uuid,p_intent uuid,p_asset_id text,p_version bigint,p_format text,p_bytes bigint,p_width integer,p_height integer)
returns jsonb language plpgsql security definer set search_path='' as $$declare r private.upload_intents;begin
 select * into r from private.upload_intents where id=p_intent and owner_id=p_actor for update;
 if not found then raise no_data_found;end if; if r.cleanup_status<>'HELD' then raise exception 'Intent cleanup in progress';end if;
 if not private.admin_session_is_active(p_actor,p_session) then raise insufficient_privilege;end if;
 if r.status='COMPLETED' then
  if r.asset_id=p_asset_id and r.version=p_version then return to_jsonb(r);end if;
  raise exception 'Completion conflict';
 end if;
 if r.status<>'PENDING' then raise exception 'Intent closed';end if;
 if statement_timestamp()>=r.expires_at then
  update private.upload_intents set status='EXPIRED' where id=r.id returning * into r;return to_jsonb(r);
 end if;
 if p_bytes is null or p_version is null or p_asset_id is null or p_format is null or p_width is null or p_height is null or p_width<0 or p_height<0 or p_bytes<=0 or p_bytes>r.max_bytes or p_version<=0 or char_length(p_asset_id) not between 1 and 128
 or (r.kind='pdf' and p_format<>'pdf') or (r.kind='image' and p_format not in('jpg','png','webp')) then
  update private.upload_intents set status='REJECTED' where id=r.id returning * into r;return to_jsonb(r);
 end if;
 update private.upload_intents set status='COMPLETED',asset_id=p_asset_id,version=p_version,format=p_format,bytes=p_bytes,width=p_width,height=p_height where id=r.id returning * into r;
 perform private.write_audit(p_actor,p_session,'MEDIA_COMPLETED','upload_intent',r.id,'{}',jsonb_build_object('category',r.category,'kind',r.kind));
 return to_jsonb(r);
end;$$;
create or replace function public.finish_media_publication(p_actor uuid,p_session uuid,p_intent uuid,p_asset_id text,p_version bigint)
returns jsonb language plpgsql security definer set search_path='' as $$declare r private.upload_intents;begin
 select * into r from private.upload_intents where id=p_intent and owner_id=p_actor for update;
 if not found then raise no_data_found;end if; if r.cleanup_status<>'HELD' then raise exception 'Intent cleanup in progress';end if;
 if not private.admin_session_is_active(p_actor,p_session) then raise insufficient_privilege;end if;
 if r.publication_status='PUBLIC' then
  if r.published_asset_id=p_asset_id and r.published_version=p_version then return to_jsonb(r);end if;
  raise exception 'Publication conflict';
 end if;
 if r.publication_status not in('PUBLISHING','FAILED') or p_version is null or p_asset_id is null or p_version<=0 or char_length(p_asset_id) not between 1 and 128 then raise exception 'Invalid publication';end if;
 update private.upload_intents set publication_status='PUBLIC',published_asset_id=p_asset_id,published_version=p_version where id=r.id returning * into r;
 perform private.write_audit(p_actor,p_session,'MEDIA_PUBLISHED','upload_intent',r.id,'{}',jsonb_build_object('reference_type',r.reference_type,'reference_id',r.reference_id));
 return to_jsonb(r);
end;$$;

-- Settings publik hanya melalui reader allowlist. Unknown key, nilai malformed per
-- key, dan metadata operator (updated_by/updated_at) tidak keluar. Validasi di sini
-- melindungi pemanggil Data API langsung; lib/backend/dto.ts menegakkan aturan sama.
-- Logo/favicon hanya path statis same-origin atau salinan Cloudinary PUBLISHED.
drop policy "Public can view website settings" on public.website_settings;
revoke select on public.website_settings from anon;
create function public.read_public_settings() returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_object_agg(s.key,s.value),'{}') from public.website_settings s
 cross join lateral (select s.value#>>'{}' as v) t
 where case
  when s.key in('registration_open','maintenance_mode') then jsonb_typeof(s.value)='boolean'
  when jsonb_typeof(s.value)<>'string' then false
  -- Subset konservatif dari DTO: setiap nilai yang lolos di sini juga lolos Zod.
  -- Karakter alfanumerik tidak pernah terpotong trim, jadi teks tidak kosong.
  when s.key in('organization_name','website_title','address','default_meta_title','default_meta_description')
   then char_length(t.v)<=500 and t.v ~ '[[:alnum:]]'
  when s.key='footer_text' then char_length(t.v)<=2000 and t.v ~ '[[:alnum:]]'
  -- Regex email identik dengan Zod 4 (zod/v4/core/regexes.js).
  when s.key='email' then char_length(t.v)<=254
   and t.v ~ '^(?:[A-Za-z0-9_''+-]+\.)*[A-Za-z0-9_''+-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$'
  when s.key='phone' then t.v ~ '^\+[1-9][0-9]{7,14}$'
  -- Host ASCII dengan TLD huruf, tanpa port/credential, path ASCII printable.
  -- Label xn-- (punycode) dikecualikan: WHATWG URL menolak punycode invalid.
  when s.key in('instagram_url','linkedin_url','github_url','youtube_url')
   then char_length(t.v)<=2048
   and t.v ~ '^https?://((?![Xx][Nn]--)[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}([/?#][!-~]*)?$'
  when s.key in('logo','favicon')
   then t.v ~ '^/([A-Za-z0-9_-]+/)*[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp|svg|ico)$'
   or t.v ~ '^https://res\.cloudinary\.com/[a-z0-9_-]+/image/upload/([a-z0-9_,]+/)?v[0-9]+/uvics/published/[a-f0-9-]{36}\.(jpg|png|webp)$'
  else false end;
$$;
revoke all on function public.read_public_settings() from public;
grant execute on function public.read_public_settings() to anon,authenticated;

-- Tutup DML langsung yang melewati audit. Policy write lama menjadi tidak efektif
-- tanpa grant; operasi tulis CMS dibuka kembali hanya melalui RPC ter-audit owner.
revoke insert,update,delete on public.pages,public.programs,public.website_settings from authenticated;
revoke all on public.pages,public.programs,public.website_settings from service_role;
grant select on public.pages,public.programs,public.website_settings to service_role;

-- Publish existing menjadi mutation+audit atomik. ID tidak ada -> P0002, bukan sukses.
create or replace function public.publish_page(p_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare previous public.content_status;
begin
 if not private.has_active_admin_session() then raise insufficient_privilege;end if;
 select status into previous from public.pages where id=p_id for update;
 if not found then raise no_data_found;end if;
 if previous='PUBLISHED' then return;end if;
 update public.pages set status='PUBLISHED',published_at=coalesce(published_at,statement_timestamp()) where id=p_id;
 perform private.write_audit(auth.uid(),'PAGE_PUBLISHED','page',p_id,jsonb_build_object('status',previous),jsonb_build_object('status','PUBLISHED'));
end;$$;
create or replace function public.publish_program(p_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare previous public.content_status;
begin
 if not private.has_active_admin_session() then raise insufficient_privilege;end if;
 select status into previous from public.programs where id=p_id for update;
 if not found then raise no_data_found;end if;
 if previous='PUBLISHED' then return;end if;
 update public.programs set status='PUBLISHED' where id=p_id;
 perform private.write_audit(auth.uid(),'PROGRAM_PUBLISHED','program',p_id,jsonb_build_object('status',previous),jsonb_build_object('status','PUBLISHED'));
end;$$;
revoke all on function public.publish_page(uuid),public.publish_program(uuid) from public,anon;
grant execute on function public.publish_page(uuid),public.publish_program(uuid) to authenticated;
