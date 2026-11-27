begin;
insert into auth.users values('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
insert into public.admins(id,name,is_active) values('00000000-0000-4000-8000-000000000001','Fixture',true),('00000000-0000-4000-8000-000000000002','Other fixture',true);
insert into auth.sessions values('00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000001',statement_timestamp());
do $$
declare u uuid:='00000000-0000-4000-8000-000000000001'; s uuid:='00000000-0000-4000-8000-000000000011'; i uuid; r jsonb; n integer;
begin
 r:=public.create_upload_intent(u,s,'poster','image');i:=(r->>'id')::uuid;
 -- Cleanup cannot free a signature slot before its replay horizon.
 begin perform private.claim_media_cleanup(i);raise exception 'early cleanup allowed';exception when check_violation then null;end;
 r:=public.complete_upload_intent(u,s,i,'fixture-asset',1,'png',100,10,10);
 if r->>'status'<>'COMPLETED' then raise exception 'valid completion failed';end if;
 perform public.complete_upload_intent(u,s,i,'fixture-asset',1,'png',100,10,10);
 select count(*) into n from public.audit_logs where entity_id=i and action='MEDIA_COMPLETED';
 if n<>1 then raise exception 'duplicate completion audit';end if;
 begin perform public.complete_upload_intent(u,s,i,'other-asset',1,'png',100,10,10);raise check_violation;exception when raise_exception then null;end;
 perform public.begin_media_publication(u,s,i,'fixture',gen_random_uuid());
 begin perform public.begin_media_publication(u,s,i,'fixture',(select reference_id from private.upload_intents where id=i));raise check_violation;exception when raise_exception then null;end;
 update private.upload_intents set issued_at=issued_at-interval '66 minutes',expires_at=expires_at-interval '66 minutes',cleanup_not_before=cleanup_not_before-interval '66 minutes' where id=i;
 begin perform private.claim_media_cleanup(i);raise exception 'referenced cleanup allowed';exception when check_violation then null;end;
 r:=public.create_upload_intent(u,s,'profile','image');i:=(r->>'id')::uuid;
 r:=public.complete_upload_intent(u,s,i,'null-metadata',1,'png',null,10,10);
 if r->>'status'<>'REJECTED' then raise exception 'null metadata accepted';end if;
 r:=public.create_upload_intent(u,s,'document','pdf');i:=(r->>'id')::uuid;
 update private.upload_intents set issued_at=issued_at-interval '66 minutes',expires_at=expires_at-interval '66 minutes',cleanup_not_before=cleanup_not_before-interval '66 minutes' where id=i;
 r:=public.complete_upload_intent(u,s,i,'expired',1,'pdf',100,0,0);
 if r->>'status'<>'EXPIRED' then raise exception 'expired completion accepted';end if;
 perform private.claim_media_cleanup(i);
 begin perform public.begin_media_publication(u,s,i,'fixture',gen_random_uuid());raise check_violation;exception when raise_exception then null;end;
 if (select cleanup_status from private.upload_intents where id=i)<>'READY' then raise exception 'cleanup claim missing';end if;
 -- Audit media service RPC membawa session terverifikasi.
 r:=public.create_upload_intent(u,s,'gallery','image');i:=(r->>'id')::uuid;
 perform public.complete_upload_intent(u,s,i,'session-asset',1,'png',100,10,10);
 perform public.begin_media_publication(u,s,i,'fixture',gen_random_uuid());
 perform public.finish_media_publication(u,s,i,'session-published',1);
 if (select count(*) from public.audit_logs where entity_id=i and session_id=s and action in('MEDIA_COMPLETED','MEDIA_PUBLISHED'))<>2 then raise exception 'media audit session missing';end if;
end$$;
rollback;
