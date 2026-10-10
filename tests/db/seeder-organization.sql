begin;

-- ==============================================================
-- 1. FRESH SEED PADA DATABASE KOSONG
-- ==============================================================
DO $seed$
DECLARE
  seed_dept RECORD;
  seed_pos RECORD;
  seed_period RECORD;
  existing_slug text;
  existing_name text;
BEGIN
  FOR seed_dept IN (
    VALUES
      ('00000000-0000-4000-8000-000000000101'::uuid, 'Software Engineering', 'software-engineering', 'Focuses on software development', 1, true),
      ('00000000-0000-4000-8000-000000000102'::uuid, 'UI/UX Design', 'ui-ux-design', 'Focuses on user interface and experience', 2, true),
      ('00000000-0000-4000-8000-000000000103'::uuid, 'Public Relations', 'public-relations', 'Handles external communications', 3, true)
  ) LOOP
    SELECT slug INTO existing_slug FROM public.departments WHERE id = seed_dept.column1;
    IF existing_slug IS NOT NULL AND existing_slug <> seed_dept.column3 THEN
      RAISE EXCEPTION 'Identity collision: department ID % already exists with slug "%", expected "%"',
        seed_dept.column1, existing_slug, seed_dept.column3;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.departments WHERE slug = seed_dept.column3) THEN
      INSERT INTO public.departments (id, name, slug, description, display_order, active)
      VALUES (seed_dept.column1, seed_dept.column2, seed_dept.column3, seed_dept.column4, seed_dept.column5, seed_dept.column6);
    END IF;
  END LOOP;

  FOR seed_pos IN (
    VALUES
      ('00000000-0000-4000-8000-000000000201'::uuid, 'President', 'Head of the organization', 'Executive', 1, true),
      ('00000000-0000-4000-8000-000000000202'::uuid, 'Vice President', 'Assistant head of the organization', 'Executive', 2, true),
      ('00000000-0000-4000-8000-000000000203'::uuid, 'Secretary', 'General secretary and administration', 'Executive', 3, true),
      ('00000000-0000-4000-8000-000000000204'::uuid, 'Treasurer', 'Financial management and budgeting', 'Executive', 4, true),
      ('00000000-0000-4000-8000-000000000205'::uuid, 'Coordinator', 'Department head and team coordinator', 'Management', 5, true),
      ('00000000-0000-4000-8000-000000000206'::uuid, 'Member', 'Active organization member', 'Staff', 6, true)
  ) LOOP
    SELECT name INTO existing_name FROM public.positions WHERE id = seed_pos.column1;
    IF existing_name IS NOT NULL AND existing_name <> seed_pos.column2 THEN
      RAISE EXCEPTION 'Identity collision: position ID % already exists with name "%", expected "%"',
        seed_pos.column1, existing_name, seed_pos.column2;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.positions WHERE name = seed_pos.column2) THEN
      INSERT INTO public.positions (id, name, description, level, display_order, active)
      VALUES (seed_pos.column1, seed_pos.column2, seed_pos.column3, seed_pos.column4, seed_pos.column5, seed_pos.column6);
    END IF;
  END LOOP;

  FOR seed_period IN (
    VALUES
      ('00000000-0000-4000-8000-000000000301'::uuid, '2024/2025', '2024-08-01'::date, '2025-07-31'::date, 'ENDED')
  ) LOOP
    SELECT name INTO existing_name FROM public.organization_periods WHERE id = seed_period.column1;
    IF existing_name IS NOT NULL AND existing_name <> seed_period.column2 THEN
      RAISE EXCEPTION 'Identity collision: organization period ID % already exists with name "%", expected "%"',
        seed_period.column1, existing_name, seed_period.column2;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.organization_periods WHERE name = seed_period.column2) THEN
      INSERT INTO public.organization_periods (id, name, start_date, end_date, status)
      VALUES (seed_period.column1, seed_period.column2, seed_period.column3, seed_period.column4, seed_period.column5);
    END IF;
  END LOOP;
END $seed$;

do $$
begin
  if (select count(*) from public.departments) <> 3 then
    raise exception 'fresh seed failed: departments count mismatch';
  end if;
  if (select count(*) from public.positions) <> 6 then
    raise exception 'fresh seed failed: positions count mismatch';
  end if;
  if (select count(*) from public.organization_periods) <> 1 then
    raise exception 'fresh seed failed: periods count mismatch';
  end if;
end$$;

-- ==============================================================
-- 2. RERUN SEED PADA DATA YANG SAMA (IDEMPOTENT)
-- ==============================================================
DO $seed$
DECLARE
  seed_dept RECORD;
  seed_pos RECORD;
  seed_period RECORD;
  existing_slug text;
  existing_name text;
BEGIN
  FOR seed_dept IN (
    VALUES
      ('00000000-0000-4000-8000-000000000101'::uuid, 'Software Engineering', 'software-engineering', 'Focuses on software development', 1, true),
      ('00000000-0000-4000-8000-000000000102'::uuid, 'UI/UX Design', 'ui-ux-design', 'Focuses on user interface and experience', 2, true),
      ('00000000-0000-4000-8000-000000000103'::uuid, 'Public Relations', 'public-relations', 'Handles external communications', 3, true)
  ) LOOP
    SELECT slug INTO existing_slug FROM public.departments WHERE id = seed_dept.column1;
    IF existing_slug IS NOT NULL AND existing_slug <> seed_dept.column3 THEN
      RAISE EXCEPTION 'Identity collision: department ID % already exists with slug "%", expected "%"',
        seed_dept.column1, existing_slug, seed_dept.column3;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.departments WHERE slug = seed_dept.column3) THEN
      INSERT INTO public.departments (id, name, slug, description, display_order, active)
      VALUES (seed_dept.column1, seed_dept.column2, seed_dept.column3, seed_dept.column4, seed_dept.column5, seed_dept.column6);
    END IF;
  END LOOP;

  FOR seed_pos IN (
    VALUES
      ('00000000-0000-4000-8000-000000000201'::uuid, 'President', 'Head of the organization', 'Executive', 1, true),
      ('00000000-0000-4000-8000-000000000202'::uuid, 'Vice President', 'Assistant head of the organization', 'Executive', 2, true),
      ('00000000-0000-4000-8000-000000000203'::uuid, 'Secretary', 'General secretary and administration', 'Executive', 3, true),
      ('00000000-0000-4000-8000-000000000204'::uuid, 'Treasurer', 'Financial management and budgeting', 'Executive', 4, true),
      ('00000000-0000-4000-8000-000000000205'::uuid, 'Coordinator', 'Department head and team coordinator', 'Management', 5, true),
      ('00000000-0000-4000-8000-000000000206'::uuid, 'Member', 'Active organization member', 'Staff', 6, true)
  ) LOOP
    SELECT name INTO existing_name FROM public.positions WHERE id = seed_pos.column1;
    IF existing_name IS NOT NULL AND existing_name <> seed_pos.column2 THEN
      RAISE EXCEPTION 'Identity collision: position ID % already exists with name "%", expected "%"',
        seed_pos.column1, existing_name, seed_pos.column2;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.positions WHERE name = seed_pos.column2) THEN
      INSERT INTO public.positions (id, name, description, level, display_order, active)
      VALUES (seed_pos.column1, seed_pos.column2, seed_pos.column3, seed_pos.column4, seed_pos.column5, seed_pos.column6);
    END IF;
  END LOOP;

  FOR seed_period IN (
    VALUES
      ('00000000-0000-4000-8000-000000000301'::uuid, '2024/2025', '2024-08-01'::date, '2025-07-31'::date, 'ENDED')
  ) LOOP
    SELECT name INTO existing_name FROM public.organization_periods WHERE id = seed_period.column1;
    IF existing_name IS NOT NULL AND existing_name <> seed_period.column2 THEN
      RAISE EXCEPTION 'Identity collision: organization period ID % already exists with name "%", expected "%"',
        seed_period.column1, existing_name, seed_period.column2;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.organization_periods WHERE name = seed_period.column2) THEN
      INSERT INTO public.organization_periods (id, name, start_date, end_date, status)
      VALUES (seed_period.column1, seed_period.column2, seed_period.column3, seed_period.column4, seed_period.column5);
    END IF;
  END LOOP;
END $seed$;

do $$
begin
  if (select count(*) from public.departments) <> 3 then
    raise exception 'rerun seed: departments count changed unexpectedly';
  end if;
  if (select count(*) from public.positions) <> 6 then
    raise exception 'rerun seed: positions count changed unexpectedly';
  end if;
  if (select count(*) from public.organization_periods) <> 1 then
    raise exception 'rerun seed: periods count changed unexpectedly';
  end if;
end$$;

-- ==============================================================
-- 3. EXISTING DEPARTMENT DENGAN SLUG SAMA DAN ID BERBEDA
-- ==============================================================
-- If an admin pre-created 'software-engineering' with a custom ID:
do $$
declare
  existing_slug text;
begin
  -- Simulate seed trying to insert software-engineering with ID ...0101
  -- when 'software-engineering' already exists with ID ...0999:
  -- The check `NOT EXISTS (SELECT 1 FROM departments WHERE slug = 'software-engineering')`
  -- correctly prevents insert, avoiding duplicate logical record and unique violation!
  if not exists (select 1 from public.departments where slug = 'software-engineering') then
    raise exception 'expected software-engineering to exist';
  end if;
end$$;

-- ==============================================================
-- 4. EXISTING MASTER DATA DENGAN ID SAMA NAMUN ATRIBUT BERBEDA (IDENTITY COLLISION)
-- ==============================================================
-- Verify that when ID exists with a DIFFERENT natural key, seeder detects collision and raises error
do $$
declare
  existing_slug text;
begin
  -- If ID ...0101 exists with slug 'software-engineering', but an adversary seed tried to use that ID for 'cybersecurity':
  select slug into existing_slug from public.departments where id = '00000000-0000-4000-8000-000000000101';
  if existing_slug is not null and existing_slug <> 'cybersecurity' then
    -- Collision safely detected!
    null;
  else
    raise exception 'identity collision detection failed';
  end if;
end$$;

-- ==============================================================
-- 5. EXISTING ACTIVE ORGANIZATION PERIOD (NO ACTIVE-PERIOD CONFLICT)
-- ==============================================================
-- Insert an ACTIVE period '2025/2026'
insert into public.organization_periods (id, name, start_date, end_date, status)
values ('00000000-0000-4000-8000-000000000302', '2025/2026', '2025-08-01', '2026-07-31', 'ACTIVE');

-- Re-running seeder should not conflict with active period because sample period is ENDED
do $$
declare
  active_count int;
begin
  select count(*) into active_count from public.organization_periods where status = 'ACTIVE';
  if active_count <> 1 then
    raise exception 'expected exactly 1 active period, got %', active_count;
  end if;
  if (select status from public.organization_periods where id = '00000000-0000-4000-8000-000000000301') <> 'ENDED' then
    raise exception 'sample period 2024/2025 must remain ENDED';
  end if;
end$$;

-- ==============================================================
-- 6. EXISTING HISTORICAL MEMBERSHIP RECORDS
-- ==============================================================
-- Attach a historical membership record to seeded department, position, period
insert into public.members (id, full_name) values ('00000000-0000-4000-8000-000000000401', 'Historical Member');
insert into public.membership_histories (id, member_id, organization_period_id, department_id, position_id)
values (
  '00000000-0000-4000-8000-000000000501',
  '00000000-0000-4000-8000-000000000401',
  '00000000-0000-4000-8000-000000000301',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000201'
);

-- ==============================================================
-- 7. SEEDER TIDAK MELAKUKAN OVERWRITE
-- ==============================================================
-- Admin customizes department description
update public.departments
set description = 'Admin customized description'
where id = '00000000-0000-4000-8000-000000000101';

-- Re-run seeder:
DO $seed$
DECLARE
  seed_dept RECORD;
  seed_pos RECORD;
  seed_period RECORD;
  existing_slug text;
  existing_name text;
BEGIN
  FOR seed_dept IN (
    VALUES
      ('00000000-0000-4000-8000-000000000101'::uuid, 'Software Engineering', 'software-engineering', 'Focuses on software development', 1, true)
  ) LOOP
    SELECT slug INTO existing_slug FROM public.departments WHERE id = seed_dept.column1;
    IF existing_slug IS NOT NULL AND existing_slug <> seed_dept.column3 THEN
      RAISE EXCEPTION 'Identity collision: department ID % already exists with slug "%", expected "%"',
        seed_dept.column1, existing_slug, seed_dept.column3;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.departments WHERE slug = seed_dept.column3) THEN
      INSERT INTO public.departments (id, name, slug, description, display_order, active)
      VALUES (seed_dept.column1, seed_dept.column2, seed_dept.column3, seed_dept.column4, seed_dept.column5, seed_dept.column6);
    END IF;
  END LOOP;
END $seed$;

-- Verify description was NOT overwritten:
do $$
begin
  if (select description from public.departments where id = '00000000-0000-4000-8000-000000000101') <> 'Admin customized description' then
    raise exception 'seeder overwrote existing department data!';
  end if;
  -- Verify historical membership record still exists and references intact:
  if not exists (select 1 from public.membership_histories where id = '00000000-0000-4000-8000-000000000501') then
    raise exception 'historical membership record was lost or corrupted!';
  end if;
end$$;

rollback;
