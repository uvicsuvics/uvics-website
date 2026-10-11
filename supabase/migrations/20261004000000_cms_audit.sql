create function public.log_cms_audit(p_action text, p_entity_type text, p_entity_id uuid, p_old jsonb, p_new jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.has_active_admin_session() then
    raise insufficient_privilege;
  end if;
  perform private.write_audit(auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_old, '{}'::jsonb), coalesce(p_new, '{}'::jsonb));
end;
$$;
grant execute on function public.log_cms_audit(text, text, uuid, jsonb, jsonb) to authenticated;
