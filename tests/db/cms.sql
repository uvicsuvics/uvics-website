begin;
do $$
declare
    u uuid := '00000000-0000-4000-8000-000000000001';
    s uuid := '00000000-0000-4000-8000-000000000011';
    t timestamptz := statement_timestamp();
    page_draft uuid;
    page_pub uuid;
begin
    -- Setup Admin Session
    insert into auth.users (id) values (u) on conflict do nothing;
    insert into public.admins (id, name, is_active) values (u, 'CMS Admin', true) on conflict do nothing;
    insert into auth.sessions (id, user_id, created_at) values (s, u, t) on conflict do nothing;

    -- Setup dummy data as superuser (postgres role)
    insert into public.pages (title, slug, content, status) values ('Draft Page', 'draft-page', 'Draft Content', 'DRAFT') returning id into page_draft;
    insert into public.pages (title, slug, content, status) values ('Pub Page', 'pub-page', 'Pub Content', 'PUBLISHED') returning id into page_pub;
    
    insert into public.programs (name, slug, description, status) values ('Draft Prog', 'draft-prog', 'Desc', 'DRAFT');
    insert into public.programs (name, slug, description, status) values ('Pub Prog', 'pub-prog', 'Desc', 'PUBLISHED');

    insert into public.website_settings (key, value) values ('organization_name', '"UVICS"');

    -- Test Anon Role (Public)
    set local role anon;
    if (select count(*) from public.pages) <> 1 then raise exception 'anon should only see 1 published page'; end if;
    if (select count(*) from public.pages where slug = 'draft-page') <> 0 then raise exception 'anon can see draft page'; end if;
    if (select count(*) from public.programs) <> 1 then raise exception 'anon should only see 1 published program'; end if;
    if (select count(*) from public.website_settings) <> 1 then raise exception 'anon cannot see website settings'; end if;
    
    -- Test Authenticated Role without Active Admin Session
    set local role authenticated;
    perform set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002"}', true);
    if (select count(*) from public.pages) <> 1 then raise exception 'non-admin should only see 1 published page'; end if;
    begin
        insert into public.pages (title, slug, content) values ('Hacked', 'hacked', 'Hacked');
        raise exception 'non-admin could insert page';
    exception when check_violation or insufficient_privilege then null; end;

    -- Test Authenticated Role with Active Admin Session
    perform set_config('request.jwt.claims', jsonb_build_object('sub', u, 'session_id', s)::text, true);
    
    if (select count(*) from public.pages) <> 2 then raise exception 'admin should see all pages'; end if;
    if (select count(*) from public.programs) <> 2 then raise exception 'admin should see all programs'; end if;

    -- Admin Insert
    insert into public.pages (title, slug, content) values ('New Admin Page', 'new-admin-page', 'Content');
    if (select count(*) from public.pages) <> 3 then raise exception 'admin insert failed'; end if;

    -- Admin Update
    update public.pages set status = 'PUBLISHED' where id = page_draft;
    if (select status from public.pages where id = page_draft) <> 'PUBLISHED' then raise exception 'admin update failed'; end if;

    -- Admin Delete
    delete from public.pages where id = page_draft;
    if (select count(*) from public.pages) <> 2 then raise exception 'admin delete failed'; end if;

    -- Admin RPC Publish
    insert into public.pages (title, slug, content, status) values ('To Publish', 'to-publish', 'Content', 'DRAFT') returning id into page_draft;
    perform public.publish_page(page_draft);
    if (select status from public.pages where id = page_draft) <> 'PUBLISHED' then raise exception 'publish RPC failed'; end if;
    if (select published_at from public.pages where id = page_draft) is null then raise exception 'publish RPC did not set published_at'; end if;

    -- Admin Website Settings Update
    update public.website_settings set value = '"UVICS Updated"' where key = 'organization_name';
    if (select value from public.website_settings where key = 'organization_name') #>> '{}' <> 'UVICS Updated' then raise exception 'admin settings update failed'; end if;

    -- Validation checks
    reset role;
    begin
        insert into public.pages (title, slug) values ('Invalid Slug', 'invalid slug!');
        raise exception 'invalid slug allowed';
    exception when check_violation then null; end;

end$$;
rollback;
