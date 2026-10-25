import { describe, expect, it } from "vitest";
import { UVICS_ORGANIZATION_PERIODS } from "@/data/mock/organization";
import { getDepartmentBySlug, getDepartments } from "@/lib/services/departmentService";
import {
  getActivePeriod,
  getCoreTeam,
  getOrganizationPeriods,
  getPeriodMembers,
} from "@/lib/services/organizationService";
import { getProgramBySlug, getPrograms } from "@/lib/services/programService";

// Posisi resmi Achievers Guidebook 2026, urut dari atas (PRD §31).
const POSITION_ORDER = ["Ketua", "Bendahara", "Sekretaris", "Steering Helper", "Koordinator", "PIC", "Anggota"];

describe("public programs, departments, and organization services (#25)", () => {
  it("exposes only fields that exist in the programs and departments tables", async () => {
    for (const program of await getPrograms()) {
      expect(Object.keys(program).sort()).toEqual(["description", "id", "image", "slug", "title"]);
    }
    for (const department of await getDepartments()) {
      expect(Object.keys(department).sort()).toEqual(["description", "id", "name", "slug"]);
    }
    expect(await getDepartmentBySlug("web-development")).toMatchObject({ name: "Web Development" });
    expect(await getDepartmentBySlug("tidak-ada")).toBeNull();
    expect(await getProgramBySlug("mentor-community")).toMatchObject({ title: "Mentor Community" });
    expect(await getProgramBySlug("tidak-ada")).toBeNull();
  });

  it("defaults to the single ACTIVE period", async () => {
    const periods = await getOrganizationPeriods();
    expect(periods.filter((period) => period.status === "ACTIVE")).toHaveLength(1);
    expect((await getActivePeriod())?.status).toBe("ACTIVE");
  });

  it("projects members through D02 and returns nothing for a period without data", async () => {
    for (const period of UVICS_ORGANIZATION_PERIODS) {
      const members = await getPeriodMembers(period.id);
      for (const member of members) {
        expect(Object.keys(member).sort()).toEqual(["department", "name", "photo", "position"]);
      }
      // Satu orang satu jabatan per periode.
      expect(new Set(members.map((member) => member.name)).size).toBe(members.length);
    }
    const upcoming = UVICS_ORGANIZATION_PERIODS.find((period) => period.status === "UPCOMING");
    expect(await getPeriodMembers(upcoming!.id)).toEqual([]);
  });
});

describe("organization profile follows the Achievers Guidebook 2026 (D22)", () => {
  it("lists only the five official departments", async () => {
    expect((await getDepartments()).map((department) => department.name)).toEqual([
      "Public Relations",
      "External Affairs",
      "Web Development",
      "Competition Handler",
      "Editor",
    ]);
  });

  it("uses official positions in order, with Ketua, Bendahara, and Sekretaris as the core team", async () => {
    const periodId = (await getActivePeriod())!.id;
    expect((await getCoreTeam(periodId)).map((member) => member.position)).toEqual([
      "Ketua",
      "Bendahara",
      "Sekretaris",
    ]);

    const departmentNames = (await getDepartments()).map((department) => department.name);
    for (const period of UVICS_ORGANIZATION_PERIODS) {
      const members = await getPeriodMembers(period.id);
      for (const member of members) {
        expect(POSITION_ORDER).toContain(member.position);
        expect(["Pengurus Inti", ...departmentNames]).toContain(member.department);
      }
      // Di tiap departemen: Steering Helper → Koordinator → PIC → Anggota.
      for (const department of new Set(members.map((member) => member.department))) {
        const ranks = members
          .filter((member) => member.department === department)
          .map((member) => POSITION_ORDER.indexOf(member.position));
        expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
      }
    }
  });
});
