import { psql, target } from "./tooling.mjs";

if (process.argv[2] !== target())
  throw Error("Usage: node scripts/seed-organization.mjs <verified-project-ref>");

const sql = `
BEGIN;

INSERT INTO public.departments (id, name, slug, description, display_order, active)
VALUES
  ('00000000-0000-4000-8000-000000000101', 'Software Engineering', 'software-engineering', 'Focuses on software development', 1, true),
  ('00000000-0000-4000-8000-000000000102', 'UI/UX Design', 'ui-ux-design', 'Focuses on user interface and experience', 2, true),
  ('00000000-0000-4000-8000-000000000103', 'Public Relations', 'public-relations', 'Handles external communications', 3, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.positions (id, name, description, level, display_order, active)
VALUES
  ('00000000-0000-4000-8000-000000000201', 'President', 'Head of the organization', 'Executive', 1, true),
  ('00000000-0000-4000-8000-000000000202', 'Vice President', 'Assistant head', 'Executive', 2, true),
  ('00000000-0000-4000-8000-000000000203', 'Coordinator', 'Department head', 'Management', 3, true),
  ('00000000-0000-4000-8000-000000000204', 'Member', 'Regular member', 'Staff', 4, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.organization_periods (id, name, start_date, end_date, status)
VALUES
  ('00000000-0000-4000-8000-000000000301', '2024/2025', '2024-08-01', '2025-07-31', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

COMMIT;
`;

psql(sql);
console.log(JSON.stringify({
  target: target(),
  status: "organization-seeded"
}));
