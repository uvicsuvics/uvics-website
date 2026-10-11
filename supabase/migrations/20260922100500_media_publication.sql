-- Only a trusted domain server workflow may request publication after checking
-- content status/consent. No browser-callable publication endpoint is provided.
create function public.begin_media_publication(p_actor uuid,p_session uuid,p_intent uuid,p_reference_type text,p_reference_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$declare r private.upload_intents;begin
 select * into r from private.upload_intents where id=p_intent and owner_id=p_actor for update;
 if not found then raise no_data_found;end if;
 if not private.admin_session_is_active(p_actor,p_session) then raise insufficient_privilege;end if;
 if r.status<>'COMPLETED' or r.kind<>'image' or r.category not in('profile','poster','thumbnail','gallery') or p_reference_type !~ '^[a-z][a-z0-9_]{0,63}$' or p_reference_id is null then raise exception 'Publication not eligible';end if;
 if r.reference_id is not null and (r.reference_id<>p_reference_id or r.reference_type<>p_reference_type) then raise exception 'Reference conflict';end if;
 if r.publication_status='PUBLIC' then return to_jsonb(r);end if;
 update private.upload_intents set publication_status='PUBLISHING',published_public_id='uvics/published/'||id,reference_type=p_reference_type,reference_id=p_reference_id where id=r.id returning * into r;
 return to_jsonb(r);
end;$$;
create function public.finish_media_publication(p_actor uuid,p_session uuid,p_intent uuid,p_asset_id text,p_version bigint)
returns jsonb language plpgsql security definer set search_path='' as $$declare r private.upload_intents;begin
 select * into r from private.upload_intents where id=p_intent and owner_id=p_actor for update;
 if not found then raise no_data_found;end if;
 if not private.admin_session_is_active(p_actor,p_session) then raise insufficient_privilege;end if;
 if r.publication_status='PUBLIC' then
  if r.published_asset_id=p_asset_id and r.published_version=p_version then return to_jsonb(r);end if;
  raise exception 'Publication conflict';
 end if;
 if r.publication_status not in('PUBLISHING','FAILED') or p_version<=0 or char_length(p_asset_id) not between 1 and 128 then raise exception 'Invalid publication';end if;
 update private.upload_intents set publication_status='PUBLIC',published_asset_id=p_asset_id,published_version=p_version where id=r.id returning * into r;
 perform private.write_audit(p_actor,'MEDIA_PUBLISHED','upload_intent',r.id,'{}',jsonb_build_object('reference_type',r.reference_type,'reference_id',r.reference_id));
 return to_jsonb(r);
end;$$;
create function public.fail_media_publication(p_actor uuid,p_session uuid,p_intent uuid)
returns void language plpgsql security definer set search_path='' as $$begin
 if not private.admin_session_is_active(p_actor,p_session) then raise insufficient_privilege;end if;
 update private.upload_intents set publication_status='FAILED' where id=p_intent and owner_id=p_actor and publication_status='PUBLISHING';
end;$$;
revoke all on function public.begin_media_publication(uuid,uuid,uuid,text,uuid),public.finish_media_publication(uuid,uuid,uuid,text,bigint),public.fail_media_publication(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.begin_media_publication(uuid,uuid,uuid,text,uuid),public.finish_media_publication(uuid,uuid,uuid,text,bigint),public.fail_media_publication(uuid,uuid,uuid) to service_role;
