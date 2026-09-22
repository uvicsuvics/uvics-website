-- Additive cleanup and null-input hardening. Existing migrations stay immutable.
create or replace function public.read_upload_intent(p_actor uuid,p_session uuid,p_intent uuid)
returns jsonb language plpgsql security definer set search_path='' as $$declare r private.upload_intents;begin
 if not private.admin_session_is_active(p_actor,p_session) then raise insufficient_privilege;end if;
 select * into r from private.upload_intents where id=p_intent and owner_id=p_actor;
 if not found then raise no_data_found;end if; if r.cleanup_status<>'HELD' then raise exception 'Intent cleanup in progress';end if;return to_jsonb(r);
end;$$;
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
 if p_bytes is null or p_version is null or p_asset_id is null or p_format is null or p_width is null or p_height is null or p_width<0 or p_height<0 or p_bytes<=0 or p_bytes>r.max_bytes or p_version is null or p_asset_id is null or p_version<=0 or char_length(p_asset_id) not between 1 and 128
 or (r.kind='pdf' and p_format<>'pdf') or (r.kind='image' and p_format not in('jpg','png','webp')) then
  update private.upload_intents set status='REJECTED' where id=r.id returning * into r;return to_jsonb(r);
 end if;
 update private.upload_intents set status='COMPLETED',asset_id=p_asset_id,version=p_version,format=p_format,bytes=p_bytes,width=p_width,height=p_height where id=r.id returning * into r;
 perform private.write_audit(p_actor,'MEDIA_COMPLETED','upload_intent',r.id,'{}',jsonb_build_object('category',r.category,'kind',r.kind));
 return to_jsonb(r);
end;$$;
create or replace function public.begin_media_publication(p_actor uuid,p_session uuid,p_intent uuid,p_reference_type text,p_reference_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$declare r private.upload_intents;begin
 select * into r from private.upload_intents where id=p_intent and owner_id=p_actor for update;
 if not found then raise no_data_found;end if; if r.cleanup_status<>'HELD' then raise exception 'Intent cleanup in progress';end if;
 if not private.admin_session_is_active(p_actor,p_session) then raise insufficient_privilege;end if;
 if r.status<>'COMPLETED' or r.kind<>'image' or r.category not in('profile','poster','thumbnail','gallery') or p_reference_type is null or p_reference_type !~ '^[a-z][a-z0-9_]{0,63}$' or p_reference_id is null then raise exception 'Publication not eligible';end if;
 if r.reference_id is not null and (r.reference_id<>p_reference_id or r.reference_type<>p_reference_type) then raise exception 'Reference conflict';end if;
 if r.publication_status='PUBLIC' then return to_jsonb(r);end if;
 update private.upload_intents set publication_status='PUBLISHING',published_public_id='uvics/published/'||id,reference_type=p_reference_type,reference_id=p_reference_id where id=r.id returning * into r;
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
 perform private.write_audit(p_actor,'MEDIA_PUBLISHED','upload_intent',r.id,'{}',jsonb_build_object('reference_type',r.reference_type,'reference_id',r.reference_id));
 return to_jsonb(r);
end;$$;
-- Operator-only claim freezes the row before touching external assets.
create function private.claim_media_cleanup(p_intent uuid) returns jsonb
language plpgsql security definer set search_path='' as $$declare r private.upload_intents;begin
 select * into r from private.upload_intents where id=p_intent for update;
 if not found then raise no_data_found;end if;
 if statement_timestamp()<r.cleanup_not_before or r.reference_id is not null then raise check_violation using message='Media held or referenced';end if;
 if r.cleanup_status='CLEANED' then return to_jsonb(r);end if;
 update private.upload_intents set cleanup_status='READY',status=case when status='PENDING' then 'EXPIRED' else status end where id=r.id returning * into r;
 return to_jsonb(r);
end;$$;
revoke all on function private.claim_media_cleanup(uuid) from public,anon,authenticated,service_role;
