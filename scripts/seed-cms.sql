BEGIN;

INSERT INTO public.pages (id, title, slug, content, meta_title, meta_description, status, published_at) VALUES
  ('00000000-0000-4000-8000-000000000901', 'Tentang UVICS (Seed)', 'seed-tentang', '<p>Konten contoh sintetis.</p>', 'Tentang UVICS', 'Halaman contoh sintetis.', 'PUBLISHED', '2026-10-01T00:00:00Z'),
  ('00000000-0000-4000-8000-000000000902', 'Draf Halaman (Seed)', 'seed-draf', '<p>Draf sintetis.</p>', NULL, NULL, 'DRAFT', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.programs (id, name, slug, short_description, description, status, display_order) VALUES
  ('00000000-0000-4000-8000-000000000911', 'Study Group (Seed)', 'seed-study-group', 'Program contoh sintetis.', '<p>Deskripsi sintetis.</p>', 'PUBLISHED', 1),
  ('00000000-0000-4000-8000-000000000912', 'Bootcamp (Seed)', 'seed-bootcamp', 'Draf program sintetis.', '', 'DRAFT', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.competitions (id, title, slug, organizer, description, category, level, registration_deadline, competition_date, registration_url, status, publication_status, featured) VALUES
  ('00000000-0000-4000-8000-000000000921', 'UI/UX Competition (Seed)', 'seed-ui-ux-competition', 'Example University', 'Lomba contoh sintetis.', 'UI/UX', 'Nasional', '2026-10-10', '2026-10-20', 'https://example.invalid/register', 'OPEN', 'PUBLISHED', true),
  ('00000000-0000-4000-8000-000000000922', 'Competitive Programming (Seed)', 'seed-competitive-programming', 'Example Institute', '', 'Programming', 'Internasional', '2026-11-01', '2026-11-15', NULL, 'UPCOMING', 'DRAFT', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.achievements (id, title, slug, competition_name, organizer, level, ranking, achievement_date, description, publication_status) VALUES
  ('00000000-0000-4000-8000-000000000931', 'Juara 1 Hackathon (Seed)', 'seed-juara-1-hackathon', 'Hackathon Contoh', 'Example Corp', 'Nasional', 'Juara 1', '2026-08-15', 'Prestasi contoh sintetis.', 'PUBLISHED'),
  ('00000000-0000-4000-8000-000000000932', 'Finalis CTF (Seed)', 'seed-finalis-ctf', 'CTF Contoh', 'Example Org', 'Internal', 'Finalis', '2026-09-01', '', 'DRAFT')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.achievement_members (id, achievement_id, member_name, role) VALUES
  ('00000000-0000-4000-8000-000000000941', '00000000-0000-4000-8000-000000000931', 'Peserta Seed Satu', 'Ketua Tim'),
  ('00000000-0000-4000-8000-000000000942', '00000000-0000-4000-8000-000000000931', 'Peserta Seed Dua', 'Anggota'),
  ('00000000-0000-4000-8000-000000000943', '00000000-0000-4000-8000-000000000932', 'Peserta Seed Tiga', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.projects (id, title, slug, summary, description, start_date, status, publication_status, featured) VALUES
  ('00000000-0000-4000-8000-000000000951', 'Smart Access (Seed)', 'seed-smart-access', 'Proyek contoh sintetis.', 'Deskripsi sintetis.', '2026-01-10', 'ONGOING', 'PUBLISHED', true),
  ('00000000-0000-4000-8000-000000000952', 'Portal Draf (Seed)', 'seed-portal-draf', 'Draf proyek sintetis.', '', NULL, 'PLANNED', 'DRAFT', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.project_members (id, project_id, member_name, role) VALUES
  ('00000000-0000-4000-8000-000000000961', '00000000-0000-4000-8000-000000000951', 'Kontributor Seed Satu', 'Project Manager'),
  ('00000000-0000-4000-8000-000000000962', '00000000-0000-4000-8000-000000000952', 'Kontributor Seed Dua', 'Engineer')
ON CONFLICT (id) DO NOTHING;

COMMIT;
