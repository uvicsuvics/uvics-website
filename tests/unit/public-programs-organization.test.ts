import { describe, expect, it } from "vitest";
import { UVICS_DEPARTMENTS } from "@/data/mock/departments";
import { CURRENT_CABINET, UVICS_ORGANIZATION_PERIODS } from "@/data/mock/organization";
import { getDepartmentBySlug, getDepartments } from "@/lib/services/departmentService";
import { getActivePeriod, getOrganizationPeriods, getPeriodMembers } from "@/lib/services/organizationService";
import { getProgramBySlug, getPrograms } from "@/lib/services/programService";

describe("public programs, departments, and organization services (#25)", () => {
  it("exposes only fields that exist in the programs and departments tables", async () => {
    for (const program of await getPrograms()) {
      expect(Object.keys(program).sort()).toEqual(["description", "id", "image", "slug", "title"]);
    }
    for (const department of await getDepartments()) {
      expect(Object.keys(department).sort()).toEqual(["description", "id", "name", "slug"]);
    }
    expect(await getDepartmentBySlug("software-engineering")).toMatchObject({ name: "Software Engineering" });
    expect(await getDepartmentBySlug("tidak-ada")).toBeNull();
    expect(await getProgramBySlug("competition-mentoring")).toMatchObject({ slug: "competition-mentoring" });
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

  it("agrees with the homepage mocks on core officers and department coordinators", async () => {
    const members = await getPeriodMembers((await getActivePeriod())!.id);
    for (const officer of CURRENT_CABINET.officers) {
      expect(members).toContainEqual(expect.objectContaining({ name: officer.name, position: officer.role }));
    }
    for (const department of UVICS_DEPARTMENTS) {
      const coordinators = members.filter(
        (member) => member.department === department.name && member.position === "Koordinator",
      );
      expect(coordinators.map((member) => member.name)).toEqual([department.coordinator]);
    }
  });
});
