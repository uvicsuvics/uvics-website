-- One publisher at a time. An interrupted PUBLISHING operation requires operator reconciliation.
create or replace function public.begin_media_publication(p_actor uuid,p_session uuid,p_intent uuid,p_reference_type text,p_reference_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$declare r private.upload_intents;begin
 select * into r from private.upload_intents where id=p_intent and owner_id=p_actor for update;
 if not found then raise no_data_found;end if; if r.cleanup_status<>'HELD' then raise exception 'Intent cleanup in progress';end if;
 if not private.admin_session_is_active(p_actor,p_session) then raise insufficient_privilege;end if;
 if r.status<>'COMPLETED' or r.kind<>'image' or r.category not in('profile','poster','thumbnail','gallery') or p_reference_type is null or p_reference_type !~ '^[a-z][a-z0-9_]{0,63}$' or p_reference_id is null then raise exception 'Publication not eligible';end if;
 if r.reference_id is not null and (r.reference_id<>p_reference_id or r.reference_type<>p_reference_type) then raise exception 'Reference conflict';end if;
 if r.publication_status='PUBLISHING' then raise exception 'Publication in progress';end if;
 if r.publication_status='PUBLIC' then return to_jsonb(r);end if;
 update private.upload_intents set publication_status='PUBLISHING',published_public_id='uvics/published/'||id,reference_type=p_reference_type,reference_id=p_reference_id where id=r.id returning * into r;
 return to_jsonb(r);
end;$$;
