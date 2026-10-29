import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { filterAchievements, getAchievementFilterFields } from "@/components/portfolio/achievementFilters";
import { filterProjects, getProjectFilterFields } from "@/components/portfolio/projectFilters";
import {
  getAchievementBySlug,
  getAchievements,
  getRelatedAchievements,
} from "@/lib/services/achievementService";
import { getCompetitionBySlug, getCompetitions } from "@/lib/services/competitionService";
import { getProjectBySlug, getProjects, getRelatedProjects } from "@/lib/services/projectService";
import { UVICS_ACHIEVEMENTS } from "@/data/mock/achievements";
import { UVICS_COMPETITIONS } from "@/data/mock/competitions";
import { UVICS_PROJECTS } from "@/data/mock/projects";

describe("frontend services (mock source)", () => {
  it("returns every item by default as a copy callers cannot mutate into the source", async () => {
    const competitions = await getCompetitions();
    expect(competitions).toEqual(UVICS_COMPETITIONS);
    expect(competitions).not.toBe(UVICS_COMPETITIONS);
    expect(await getProjects()).toHaveLength(UVICS_PROJECTS.length);
    expect(await getAchievements()).toHaveLength(UVICS_ACHIEVEMENTS.length);
  });

  it("applies a positive limit and ignores a missing or non-positive one", async () => {
    expect(await getCompetitions({ limit: 2 })).toEqual(UVICS_COMPETITIONS.slice(0, 2));
    expect(await getProjects({ limit: 0 })).toHaveLength(UVICS_PROJECTS.length);
    expect(await getAchievements({ limit: 2 })).toHaveLength(2);
  });

  it("finds a published item by slug and returns null for an unknown slug", async () => {
    const [competition] = UVICS_COMPETITIONS;
    const [project] = UVICS_PROJECTS;
    const [achievement] = UVICS_ACHIEVEMENTS;
    expect(await getCompetitionBySlug(competition.slug)).toEqual(competition);
    expect((await getProjectBySlug(project.slug))?.project).toEqual(project);
    expect((await getAchievementBySlug(achievement.slug))?.achievement).toEqual(achievement);
    expect(await getCompetitionBySlug("tidak-ada")).toBeNull();
  });

  it("resolves every slug the homepage renders to a detail page", async () => {
    for (const { achievement } of await getAchievements({ limit: 3 })) {
      expect((await getAchievementBySlug(achievement.slug))?.achievement.id).toBe(achievement.id);
    }
    for (const { project } of await getProjects({ limit: 3 })) {
      expect((await getProjectBySlug(project.slug))?.project.id).toBe(project.id);
    }
  });

  it("serves portfolio data from one mock and service per domain", () => {
    expect(existsSync("lib/services/portfolioService.ts")).toBe(false);
    expect(existsSync("data/mock/portfolio.ts")).toBe(false);
  });
});

describe("achievementService", () => {
  it("sorts achievements newest first", async () => {
    const dates = (await getAchievements()).map(({ achievement }) => achievement.achievementDate);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(dates).toHaveLength(UVICS_ACHIEVEMENTS.length);
  });

  it("joins registered and guest participants with the related project", async () => {
    const detail = await getAchievementBySlug("juara-1-national-ai-hackathon-2026");
    expect(detail?.members.map((m) => m.name)).toEqual(["Dave Sumampouw", "Sarah Manoppo", "Kevin Kalangi"]);
    expect(detail?.project?.id).toBe("proj-nusantara-vision");

    const guest = await getAchievementBySlug("top-5-finalist-gemastik-xvii");
    expect(guest?.members.map((m) => m.name)).toContain("Alvin Mokodompit");
    expect(guest?.project).toBeNull();
  });

  it("returns null or nothing for an unknown slug", async () => {
    expect(await getAchievementBySlug("tidak-ada")).toBeNull();
    expect(await getRelatedAchievements("tidak-ada")).toEqual([]);
  });

  it("excludes the achievement itself from related ones and respects the limit", async () => {
    const slug = "juara-1-national-ai-hackathon-2026";
    const related = await getRelatedAchievements(slug, 2);
    expect(related).toHaveLength(2);
    expect(related.some(({ achievement }) => achievement.slug === slug)).toBe(false);
  });
});

describe("achievementFilters", () => {
  it("builds year (newest first) and unique ranking options from the data", async () => {
    const fields = getAchievementFilterFields(await getAchievements());
    const years = fields.find((f) => f.id === "year")?.options.map((o) => o.value);
    expect(years).toEqual(["2026", "2025", "2024"]);
    const rankings = fields.find((f) => f.id === "ranking")?.options.map((o) => o.value);
    expect(rankings).toEqual(["Juara 1", "Juara 2", "Top 5 Finalis"]);
  });

  it("filters by year and ranking; an empty value means all", async () => {
    const items = await getAchievements();
    expect(filterAchievements(items, {})).toHaveLength(items.length);
    expect(filterAchievements(items, { year: "2026" })).toHaveLength(2);
    expect(filterAchievements(items, { year: "2026", ranking: "Juara 1" })).toHaveLength(2);
    expect(filterAchievements(items, { year: "2024", ranking: "Juara 1" })).toHaveLength(0);
    expect(filterAchievements(items, { level: "INTERNASIONAL" })).toHaveLength(0);
  });
});

describe("projectService", () => {
  it("sorts projects by newest startDate", async () => {
    const dates = (await getProjects()).map(({ project }) => project.startDate);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("joins the team and the related achievements", async () => {
    const detail = await getProjectBySlug("nusantaravision-crop-ai");
    expect(detail?.members.map((m) => m.role)).toContain("Project Lead");
    expect(detail?.achievements.map(({ achievement }) => achievement.slug)).toEqual([
      "juara-1-national-ai-hackathon-2026",
    ]);
    expect((await getProjectBySlug("klabat-ctf-security-arena"))?.achievements).toEqual([]);
  });

  it("returns null or nothing for an unknown slug", async () => {
    expect(await getProjectBySlug("tidak-ada")).toBeNull();
    expect(await getRelatedProjects("tidak-ada")).toEqual([]);
  });

  it("excludes the project itself from related ones, same status first, and respects the limit", async () => {
    const related = await getRelatedProjects("klabat-campus-superapp", 2);
    expect(related).toHaveLength(2);
    expect(related.every(({ project }) => project.slug !== "klabat-campus-superapp")).toBe(true);
    expect(related.every(({ project }) => project.status === "COMPLETED")).toBe(true);
  });
});

describe("projectFilters", () => {
  it("builds year options and filters by year and status", async () => {
    const items = await getProjects();
    const fields = getProjectFilterFields(items);
    expect(fields.find((f) => f.id === "year")?.options.map((o) => o.value)).toEqual(["2026", "2025"]);
    expect(filterProjects(items, {})).toHaveLength(items.length);
    expect(filterProjects(items, { year: "2025" })).toHaveLength(2);
    expect(filterProjects(items, { status: "ONGOING" })).toHaveLength(1);
    expect(filterProjects(items, { year: "2025", status: "ONGOING" })).toHaveLength(0);
  });
});
