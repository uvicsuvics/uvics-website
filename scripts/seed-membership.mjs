import { psql, target } from "./tooling.mjs";

if (process.argv[2] !== target())
  throw Error("Usage: node scripts/seed-membership.mjs <verified-project-ref>");

const sql = `
BEGIN;

-- Insert Registrations
INSERT INTO public.registrations (id, full_name, nim, email, phone, faculty, study_program, batch, status)
VALUES
  ('00000000-0000-4000-8000-000000000401', 'Applicant Satu', '105021810021', 'applicant1@student.unklab.ac.id', '+6281200000001', 'FIK', 'Informatika', 2023, 'SUBMITTED'),
  ('00000000-0000-4000-8000-000000000402', 'Applicant Dua', '105021810022', 'applicant2@student.unklab.ac.id', '+6281200000002', 'FIK', 'Sistem Informasi', 2023, 'UNDER_REVIEW')
ON CONFLICT (id) DO NOTHING;

-- Insert Members (Active, Inactive, Alumni)
INSERT INTO public.members (id, full_name, nim, email, phone, faculty, study_program, batch, status)
VALUES
  ('00000000-0000-4000-8000-000000000501', 'Active Member', '105021810031', 'active@student.unklab.ac.id', '+6281200000011', 'FIK', 'Informatika', 2022, 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000502', 'Inactive Member', '105021810032', 'inactive@student.unklab.ac.id', '+6281200000012', 'FIK', 'Sistem Informasi', 2022, 'INACTIVE'),
  ('00000000-0000-4000-8000-000000000503', 'Alumni Member', '105021810033', 'alumni@student.unklab.ac.id', '+6281200000013', 'FIK', 'Informatika', 2020, 'ALUMNI')
ON CONFLICT (id) DO NOTHING;

COMMIT;
`;

psql(sql);
console.log(JSON.stringify({
  target: target(),
  status: "membership-seeded"
}));
