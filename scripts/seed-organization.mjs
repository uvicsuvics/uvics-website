import { psql, target } from "./tooling.mjs";

export const organizationSeedSql = `
DO $seed$
DECLARE
  seed_dept RECORD;
  seed_pos RECORD;
  seed_period RECORD;
  existing_slug text;
  existing_name text;
BEGIN
  -- 1. Departments: natural key is slug
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

  -- 2. Positions: natural key is name
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

  -- 3. Organization Periods: sample period 2024/2025 ENDED
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
`;

if (process.argv[1]?.endsWith("seed-organization.mjs")) {
  if (process.argv[2] !== target()) {
    throw Error("Usage: node scripts/seed-organization.mjs <verified-project-ref>");
  }

  psql(`BEGIN;\n${organizationSeedSql}\nCOMMIT;`);
  console.log(
    JSON.stringify({
      target: target(),
      status: "organization-seeded",
    }),
  );
}
