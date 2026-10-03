import { psql, target } from "./tooling.mjs";

if (process.argv[2] !== target()) {
  throw Error("Usage: node scripts/seed-cms.mjs <verified-project-ref>");
}

const seedSql = `
BEGIN;

-- Seed Settings
INSERT INTO public.website_settings (key, value) VALUES
  ('organization_name', '"UVICS - Unklab Virtue In Computer Science"'),
  ('website_title', '"UVICS Official Website"'),
  ('email', '"contact@uvics.org"'),
  ('instagram_url', '"https://instagram.com/uvics"'),
  ('registration_open', 'true')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Seed Pages
INSERT INTO public.pages (title, slug, content, meta_title, meta_description, status) VALUES
  ('About Us', 'about', '<p>Welcome to UVICS. We are the premier computer science organization at Universitas Klabat.</p>', 'About UVICS', 'Learn more about UVICS.', 'PUBLISHED'),
  ('Contact', 'contact', '<p>Contact us at contact@uvics.org</p>', 'Contact Us', 'Get in touch with UVICS.', 'PUBLISHED'),
  ('Secret Draft', 'secret-draft', '<p>This is a draft.</p>', 'Draft', 'Draft desc.', 'DRAFT')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  status = EXCLUDED.status;

-- Seed Programs
INSERT INTO public.programs (name, slug, short_description, description, status, display_order) VALUES
  ('Competitive Programming', 'cp', 'Join our CP division', '<p>Weekly training for competitive programming.</p>', 'PUBLISHED', 1),
  ('Web Development', 'web-dev', 'Learn modern web dev', '<p>Full-stack web development with Next.js and Supabase.</p>', 'PUBLISHED', 2),
  ('UI/UX Design', 'ui-ux', 'Design beautiful apps', '<p>Learn Figma and design systems.</p>', 'DRAFT', 3)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

COMMIT;
`;

console.log(`Seeding CMS foundation for project ${target()}...`);
psql(seedSql);
console.log("CMS seeding completed successfully.");
