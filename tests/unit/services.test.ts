import { describe, expect, it } from "vitest";
import { getAchievementBySlug, getAchievements } from "@/lib/services/achievementService";
import { getCompetitionBySlug, getCompetitions } from "@/lib/services/competitionService";
import { getProjectBySlug, getProjects } from "@/lib/services/projectService";
import { UVICS_ACHIEVEMENTS } from "@/data/mock/achievements";
import { UVICS_COMPETITIONS } from "@/data/mock/competitions";
import { UVICS_PROJECTS } from "@/data/mock/projects";

describe("frontend services (mock source)", () => {
  it("returns every item by default as a copy callers cannot mutate into the source", async () => {
    const competitions = await getCompetitions();
    expect(competitions).toEqual(UVICS_COMPETITIONS);
    expect(competitions).not.toBe(UVICS_COMPETITIONS);
    expect(await getProjects()).toEqual(UVICS_PROJECTS);
    expect(await getAchievements()).toEqual(UVICS_ACHIEVEMENTS);
  });

  it("applies a positive limit and ignores a missing or non-positive one", async () => {
    expect(await getCompetitions({ limit: 2 })).toEqual(UVICS_COMPETITIONS.slice(0, 2));
    expect(await getProjects({ limit: 0 })).toHaveLength(UVICS_PROJECTS.length);
  });

  it("finds a published item by slug and returns null for an unknown slug", async () => {
    const [competition] = UVICS_COMPETITIONS;
    const [project] = UVICS_PROJECTS;
    const [achievement] = UVICS_ACHIEVEMENTS;
    expect(await getCompetitionBySlug(competition.slug)).toEqual(competition);
    expect(await getProjectBySlug(project.slug)).toEqual(project);
    expect(await getAchievementBySlug(achievement.slug)).toEqual(achievement);
    expect(await getCompetitionBySlug("tidak-ada")).toBeNull();
  });
});
