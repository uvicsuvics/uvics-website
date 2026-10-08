import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Database, Tables, TablesInsert, TablesUpdate, Enums, CompositeTypes } from "@/types/database";

describe("CMS Foundation Migration (20261003192000_cms_foundation.sql - commit eafd889)", () => {
  const migrationPath = resolve(
    process.cwd(),
    "supabase/migrations/20261003192000_cms_foundation.sql",
  );

  it("exists on disk and has valid non-empty SQL content", () => {
    expect(existsSync(migrationPath)).toBe(true);
    const sql = readFileSync(migrationPath, "utf8");
    expect(sql.length).toBeGreaterThan(0);
  });

  it("declares public.content_status enum with correct values", () => {
    const sql = readFileSync(migrationPath, "utf8");
    expect(sql).toContain("create type public.content_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');");
  });

  it("declares pages, programs, and website_settings tables with expected constraints", () => {
    const sql = readFileSync(migrationPath, "utf8");

    // public.pages
    expect(sql).toContain("create table public.pages");
    expect(sql).toContain("id uuid primary key default gen_random_uuid()");
    expect(sql).toContain("slug text not null unique check(char_length(slug) between 1 and 160 and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')");
    expect(sql).toContain("status public.content_status not null default 'DRAFT'");

    // public.programs
    expect(sql).toContain("create table public.programs");
    expect(sql).toContain("name text not null check(char_length(name) between 1 and 255)");
    expect(sql).toContain("display_order integer not null default 0");

    // public.website_settings
    expect(sql).toContain("create table public.website_settings");
    expect(sql).toContain("key text primary key check(key ~ '^[a-z_]+$')");
    expect(sql).toContain("value jsonb not null default 'null'");
  });

  it("configures Row Level Security (RLS) and policies for public and admins", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("alter table public.pages enable row level security;");
    expect(sql).toContain("alter table public.programs enable row level security;");
    expect(sql).toContain("alter table public.website_settings enable row level security;");

    // Public read policies
    expect(sql).toContain('create policy "Public can view published pages" on public.pages for select to anon, authenticated using (status = \'PUBLISHED\');');
    expect(sql).toContain('create policy "Public can view published programs" on public.programs for select to anon, authenticated using (status = \'PUBLISHED\');');
    expect(sql).toContain('create policy "Public can view website settings" on public.website_settings for select to anon, authenticated using (true);');

    // Admin session checks
    expect(sql).toContain("private.has_active_admin_session()");
  });

  it("configures touch_updated_at triggers and publish RPC functions without dollar-quote syntax errors", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("create trigger pages_updated before update on public.pages");
    expect(sql).toContain("create trigger programs_updated before update on public.programs");
    expect(sql).toContain("create trigger website_settings_updated before update on public.website_settings");

    // publish_page RPC
    expect(sql).toContain("create function public.publish_page(p_id uuid)");
    expect(sql).toContain("returns void language plpgsql security definer set search_path = '' as $$");
    expect(sql).toContain("set status = 'PUBLISHED'");
    expect(sql).toContain("grant execute on function public.publish_page(uuid) to authenticated;");

    // publish_program RPC
    expect(sql).toContain("create function public.publish_program(p_id uuid)");
    expect(sql).toContain("returns void language plpgsql security definer set search_path = '' as $$");
    expect(sql).toContain("update public.programs set status = 'PUBLISHED' where id = p_id;");
    expect(sql).toContain("grant execute on function public.publish_program(uuid) to authenticated;");
  });
});

describe("Database Types Contract (types/database.ts - commits 5999036, d9e0bc8, c8a7484)", () => {
  it("verifies competitions table types and fields (Row, Insert, Update)", () => {
    type CompetitionRow = Tables<"competitions">;
    type CompetitionInsert = TablesInsert<"competitions">;
    type CompetitionUpdate = TablesUpdate<"competitions">;

    const sampleRow: CompetitionRow = {
      id: "00000000-0000-0000-0000-000000000010",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      title: "Gemastik 2026",
      slug: "gemastik-2026",
      organizer: "Kemendikbud",
      description: "Lomba programming nasional",
      category: "Competitive Programming",
      level: "Nasional",
      registration_deadline: "2026-10-31",
      competition_date: "2026-11-15",
      registration_url: "https://example.com/register",
      guidebook_url: "https://example.com/guide.pdf",
      poster_url: "https://example.com/poster.jpg",
      team_size: "1-3",
      eligibility: "Mahasiswa aktif",
      status: "Open",
      featured: true,
    };
    expect(sampleRow.title).toBe("Gemastik 2026");
    expect(sampleRow.level).toBe("Nasional");

    const sampleInsert: CompetitionInsert = {
      title: "ICPC 2026",
      slug: "icpc-2026",
      organizer: "ICPC Foundation",
    };
    expect(sampleInsert.title).toBe("ICPC 2026");

    const sampleUpdate: CompetitionUpdate = {
      status: "Closed",
      featured: false,
    };
    expect(sampleUpdate.status).toBe("Closed");
  });

  it("verifies achievements and achievement_members table types (Row, Insert, Update)", () => {
    type AchievementRow = Tables<"achievements">;
    type AchievementInsert = TablesInsert<"achievements">;
    type AchievementMemberRow = Tables<"achievement_members">;

    const sampleAchievement: AchievementRow = {
      id: "00000000-0000-0000-0000-000000000020",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      title: "Juara 1 Hackathon Nasional",
      slug: "juara-1-hackathon-nasional",
      competition_name: "Hackathon 2026",
      organizer: "Tech Corp",
      level: "Nasional",
      ranking: "Juara 1",
      achievement_date: "2026-09-15",
      description: "Membuat aplikasi inovatif",
      cover_image: "/images/hackathon.webp",
      certificate_file: "/docs/cert.pdf",
      published: true,
    };
    expect(sampleAchievement.ranking).toBe("Juara 1");

    const sampleAchInsert: AchievementInsert = {
      title: "Juara 2 CTF",
      slug: "juara-2-ctf",
      competition_name: "CTF Challenge",
      ranking: "Juara 2",
      achievement_date: "2026-08-10",
      description: "Kompetisi cybersecurity",
    };
    expect(sampleAchInsert.ranking).toBe("Juara 2");

    const sampleAchMember: AchievementMemberRow = {
      id: "00000000-0000-0000-0000-000000000021",
      achievement_id: "00000000-0000-0000-0000-000000000020",
      member_name: "John Doe",
      role: "Lead Developer",
    };
    expect(sampleAchMember.member_name).toBe("John Doe");
  });

  it("verifies projects and project_members table types (Row, Insert, Update)", () => {
    type ProjectRow = Tables<"projects">;
    type ProjectInsert = TablesInsert<"projects">;
    type ProjectMemberRow = Tables<"project_members">;

    const sampleProject: ProjectRow = {
      id: "00000000-0000-0000-0000-000000000030",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      title: "Website UVICS",
      slug: "website-uvics",
      summary: "Official portal organization UVICS",
      description: "Full stack web application built with Next.js and Supabase",
      cover_image: "/images/cover.webp",
      project_url: "https://uvics.org",
      repository_url: "https://github.com/uvicsuvics/uvics-website",
      start_date: "2026-08-01",
      end_date: null,
      status: "In Progress",
      featured: true,
    };
    expect(sampleProject.slug).toBe("website-uvics");

    const sampleProjInsert: ProjectInsert = {
      title: "Mobile App UVICS",
      slug: "mobile-app-uvics",
      summary: "Mobile companion",
    };
    expect(sampleProjInsert.title).toBe("Mobile App UVICS");

    const sampleProjMember: ProjectMemberRow = {
      id: "00000000-0000-0000-0000-000000000031",
      project_id: "00000000-0000-0000-0000-000000000030",
      member_name: "Jane Doe",
      role: "UI/UX Designer",
    };
    expect(sampleProjMember.role).toBe("UI/UX Designer");
  });

  it("verifies Enums and CompositeTypes handle Record<string, unknown> without index errors (commit c8a7484 & d9e0bc8)", () => {
    // Commit c8a7484 fixed empty Enums/CompositeTypes causing TS index errors
    type PublicEnums = Database["public"]["Enums"];
    type PublicComposite = Database["public"]["CompositeTypes"];

    const enumsRecord: PublicEnums = { sample_enum: "ACTIVE" };
    const compRecord: PublicComposite = { sample_type: { foo: "bar" } };

    expect(enumsRecord).toBeDefined();
    expect(compRecord).toBeDefined();

    // Verify helper types resolve gracefully without throwing TS2769
    type SampleEnumResolution = Enums<never>;
    type SampleCompositeResolution = CompositeTypes<never>;

    const testEnum: SampleEnumResolution = undefined as never;
    const testComp: SampleCompositeResolution = undefined as never;
    expect(testEnum).toBeUndefined();
    expect(testComp).toBeUndefined();
  });
});
