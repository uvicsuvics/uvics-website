import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const { requireAdmin } = vi.hoisted(() => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin }));

import { AppError } from "@/lib/backend/errors";
import {
  POSITION_LEVELS,
  activateOrganizationPeriod,
  assignMembershipHistory,
  assignMembershipHistoryInputSchema,
  createDepartment,
  createDepartmentInputSchema,
  createOrganizationPeriod,
  createOrganizationPeriodInputSchema,
  createPosition,
  createPositionInputSchema,
  deleteDepartment,
  deleteOrganizationPeriod,
  deletePosition,
  departmentSchema,
  endMembershipHistory,
  endMembershipHistoryInputSchema,
  endOrganizationPeriod,
  organizationPeriodSchema,
  positionLevelSchema,
  positionSchema,
  setDepartmentActive,
  setPositionActive,
  updateDepartment,
  updateDepartmentInputSchema,
  updateOrganizationPeriod,
  updateOrganizationPeriodInputSchema,
  updatePosition,
  updatePositionInputSchema,
} from "@/lib/backend/organization";
import * as organizationModule from "@/lib/backend/organization";

type RpcResult = {
  data: unknown;
  error: { code?: string; message?: string } | null;
};

const ok = (data: unknown): RpcResult => ({ data, error: null });
const fail = (code: string, message?: string): RpcResult => ({
  data: null,
  error: { code, ...(message ? { message } : {}) },
});

function fakeClient(rpcResult: RpcResult = ok(null)) {
  const rpc = vi.fn(async () => rpcResult);
  return {
    client: { rpc } as unknown as SupabaseClient<Database>,
    rpc,
  };
}

const ADMIN_ID = "00000000-0000-4000-8000-000000000001";
const SESSION_ID = "00000000-0000-4000-8000-000000000011";
const DEPT_ID = "00000000-0000-4000-8000-000000000101";
const POS_ID = "00000000-0000-4000-8000-000000000201";
const PERIOD_ID = "00000000-0000-4000-8000-000000000301";
const MEMBER_ID = "00000000-0000-4000-8000-000000000401";
const HISTORY_ID = "00000000-0000-4000-8000-000000000501";

const periodRow = {
  id: PERIOD_ID,
  name: "2026/2027",
  start_date: "2026-08-01",
  end_date: "2027-07-31",
  status: "UPCOMING",
  created_at: "2026-11-27T10:00:00.123456+08:00",
  updated_at: "2026-11-27T02:00:00+00:00",
};

const departmentRow = {
  id: DEPT_ID,
  name: "Web Development",
  slug: "web-development",
  description: "Membangun website UVICS",
  display_order: 3,
  active: true,
  created_at: "2026-11-27T10:00:00.123456+08:00",
  updated_at: "2026-11-27T02:00:00+00:00",
};

const positionRow = {
  id: POS_ID,
  name: "Coordinator",
  description: "Koordinator departemen",
  level: "COORDINATOR",
  display_order: 6,
  active: true,
  created_at: "2026-11-27T10:00:00.123456+08:00",
  updated_at: "2026-11-27T02:00:00+00:00",
};

const historyRow = {
  id: HISTORY_ID,
  member_id: MEMBER_ID,
  organization_period_id: PERIOD_ID,
  department_id: DEPT_ID,
  position_id: POS_ID,
  start_date: "2026-08-15",
  end_date: null,
  notes: "Penempatan awal",
  created_at: "2026-11-27T10:00:00.123456+08:00",
  updated_at: "2026-11-27T02:00:00+00:00",
};

beforeEach(() => {
  vi.clearAllMocks();
  requireAdmin.mockResolvedValue({
    id: ADMIN_ID,
    name: "Admin",
    sessionId: SESSION_ID,
  });
});

describe("Organization domain schemas", () => {
  it("keeps membership row schemas out of organization module exports", () => {
    expect("memberSchema" in organizationModule).toBe(false);
    expect("membershipHistorySchema" in organizationModule).toBe(false);
    expect("registrationSchema" in organizationModule).toBe(false);
  });

  describe("departmentSchema", () => {
    const validDepartment = {
      id: DEPT_ID,
      name: "Software Engineering",
      slug: "software-engineering",
      description: "Handles engineering",
      display_order: 1,
      active: true,
      created_at: "2026-09-22T10:00:00.123456+00:00",
      updated_at: "2026-09-22T10:00:00.123456+00:00",
    };

    it("parses valid department", () => {
      const res = departmentSchema.safeParse(validDepartment);
      expect(res.success).toBe(true);
    });

    it("accepts offset timestamps and Z timestamps", () => {
      expect(
        departmentSchema.safeParse({
          ...validDepartment,
          created_at: "2026-09-22T18:00:00.123456+08:00",
          updated_at: "2026-09-22T10:00:00.000Z",
        }).success,
      ).toBe(true);
    });

    it("rejects invalid timestamps", () => {
      expect(
        departmentSchema.safeParse({ ...validDepartment, created_at: "not-a-timestamp" }).success,
      ).toBe(false);
      expect(
        departmentSchema.safeParse({ ...validDepartment, updated_at: "2026-09-22" }).success,
      ).toBe(false);
    });

    it("enforces lowercase kebab-case for slug", () => {
      expect(
        departmentSchema.safeParse({ ...validDepartment, slug: "Software Engineering" }).success,
      ).toBe(false);
      expect(
        departmentSchema.safeParse({ ...validDepartment, slug: "software_engineering" }).success,
      ).toBe(false);
      expect(
        departmentSchema.safeParse({ ...validDepartment, slug: "software--engineering" }).success,
      ).toBe(false);
      expect(
        departmentSchema.safeParse({ ...validDepartment, slug: "-software-engineering" }).success,
      ).toBe(false);
      expect(
        departmentSchema.safeParse({ ...validDepartment, slug: "software-engineering-" }).success,
      ).toBe(false);
      expect(
        departmentSchema.safeParse({ ...validDepartment, slug: "software-eng-123" }).success,
      ).toBe(true);
    });
  });

  describe("positionSchema", () => {
    const validPosition = {
      id: POS_ID,
      name: "President",
      description: "Organization President",
      level: "CORE",
      display_order: 1,
      active: true,
      created_at: "2026-09-22T10:00:00.123456+00:00",
      updated_at: "2026-09-22T10:00:00.123456+00:00",
    };

    it("parses valid position", () => {
      const res = positionSchema.safeParse(validPosition);
      expect(res.success).toBe(true);
    });

    it("accepts all canonical D29 position levels in official hierarchy order", () => {
      expect(POSITION_LEVELS).toEqual([
        "ADVISOR",
        "CORE",
        "STEERING_HELPER",
        "COORDINATOR",
        "PIC",
        "MEMBER",
      ]);

      for (const level of POSITION_LEVELS) {
        expect(positionLevelSchema.safeParse(level).success).toBe(true);
        expect(positionSchema.safeParse({ ...validPosition, level }).success).toBe(true);
      }
    });

    it("rejects non-canonical position levels (D29)", () => {
      for (const level of [
        "Executive",
        "Management",
        "Staff",
        "Vice President",
        "VICE_PRESIDENT",
        "core",
        "member",
        "",
        "ADMIN",
      ]) {
        expect(positionLevelSchema.safeParse(level).success).toBe(false);
        expect(positionSchema.safeParse({ ...validPosition, level }).success).toBe(false);
      }
    });

    it("accepts offset timestamps and Z timestamps", () => {
      expect(
        positionSchema.safeParse({
          ...validPosition,
          created_at: "2026-09-22T18:00:00+08:00",
          updated_at: "2026-09-22T10:00:00Z",
        }).success,
      ).toBe(true);
    });

    it("rejects invalid timestamps", () => {
      expect(
        positionSchema.safeParse({ ...validPosition, created_at: "not-a-timestamp" }).success,
      ).toBe(false);
      expect(
        positionSchema.safeParse({ ...validPosition, updated_at: "2026-09-22" }).success,
      ).toBe(false);
    });

    it("rejects invalid level or name lengths", () => {
      expect(positionSchema.safeParse({ ...validPosition, name: "" }).success).toBe(false);
      expect(positionSchema.safeParse({ ...validPosition, level: "" }).success).toBe(false);
    });
  });

  describe("organizationPeriodSchema", () => {
    const validPeriod = {
      id: PERIOD_ID,
      name: "2024/2025",
      start_date: "2024-08-01",
      end_date: "2025-07-31",
      status: "ENDED" as const,
      created_at: "2026-09-22T10:00:00.123456+00:00",
      updated_at: "2026-09-22T10:00:00.123456+00:00",
    };

    it("parses valid organization period", () => {
      const res = organizationPeriodSchema.safeParse(validPeriod);
      expect(res.success).toBe(true);
    });

    it("accepts offset timestamps and Z timestamps", () => {
      expect(
        organizationPeriodSchema.safeParse({
          ...validPeriod,
          created_at: "2026-09-22T18:00:00.654321+08:00",
          updated_at: "2026-09-22T10:00:00.000Z",
        }).success,
      ).toBe(true);
    });

    it("rejects invalid timestamps", () => {
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, created_at: "not-a-timestamp" }).success,
      ).toBe(false);
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, updated_at: "2026-09-22" }).success,
      ).toBe(false);
    });

    it("validates strict YYYY-MM-DD calendar dates", () => {
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, start_date: "2024/08/01" }).success,
      ).toBe(false);
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, start_date: "01-08-2024" }).success,
      ).toBe(false);
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, start_date: "2024-02-30" }).success,
      ).toBe(false);
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, end_date: "not-a-date" }).success,
      ).toBe(false);
    });

    it("enforces start_date <= end_date", () => {
      const sameDay = organizationPeriodSchema.safeParse({
        ...validPeriod,
        start_date: "2024-08-01",
        end_date: "2024-08-01",
      });
      expect(sameDay.success).toBe(true);

      const invalidRange = organizationPeriodSchema.safeParse({
        ...validPeriod,
        start_date: "2025-08-01",
        end_date: "2024-08-01",
      });
      expect(invalidRange.success).toBe(false);
      if (!invalidRange.success) {
        expect(invalidRange.error.issues[0]?.path).toEqual(["end_date"]);
      }
    });

    it("only permits UPCOMING, ACTIVE, ENDED statuses", () => {
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, status: "UPCOMING" }).success,
      ).toBe(true);
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, status: "ACTIVE" }).success,
      ).toBe(true);
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, status: "ENDED" }).success,
      ).toBe(true);
      expect(
        organizationPeriodSchema.safeParse({
          ...validPeriod,
          status: "ARCHIVED" as unknown as "UPCOMING",
        }).success,
      ).toBe(false);
    });
  });

  describe("mutation input schemas", () => {
    it("rejects unknown fields and invalid dates on period input schemas", () => {
      expect(
        createOrganizationPeriodInputSchema.safeParse({
          name: "2026/2027",
          start_date: "2026-08-01",
          end_date: "2027-07-31",
          status: "ACTIVE",
        }).success,
      ).toBe(false);
      expect(
        createOrganizationPeriodInputSchema.safeParse({
          name: "2026/2027",
          start_date: "2027-08-01",
          end_date: "2026-07-31",
        }).success,
      ).toBe(false);
      expect(updateOrganizationPeriodInputSchema.safeParse({}).success).toBe(false);
      expect(
        updateOrganizationPeriodInputSchema.safeParse({
          start_date: "2027-08-01",
          end_date: "2026-07-31",
        }).success,
      ).toBe(false);
    });

    it("validates department, position, and membership history input schemas", () => {
      expect(
        createDepartmentInputSchema.safeParse({
          name: "Web Development",
          slug: "web-development",
        }).success,
      ).toBe(true);
      expect(updateDepartmentInputSchema.safeParse({}).success).toBe(false);

      expect(
        createPositionInputSchema.safeParse({
          name: "President",
          level: "CORE",
        }).success,
      ).toBe(true);
      expect(
        createPositionInputSchema.safeParse({
          name: "VP",
          level: "Executive",
        }).success,
      ).toBe(false);
      expect(updatePositionInputSchema.safeParse({}).success).toBe(false);

      expect(
        assignMembershipHistoryInputSchema.safeParse({
          member_id: MEMBER_ID,
          organization_period_id: PERIOD_ID,
          department_id: null,
          position_id: POS_ID,
          start_date: "2026-08-15",
          end_date: "2026-08-01",
        }).success,
      ).toBe(false);
      expect(
        endMembershipHistoryInputSchema.safeParse({
          end_date: "2026-12-31",
          notes: "Selesai masa bakti",
        }).success,
      ).toBe(true);
    });
  });
});

describe("Organization admin mutations (#75)", () => {
  describe("authorization guard", () => {
    it("calls requireAdmin first and returns OperationResult failure without calling RPC when denied", async () => {
      const { client, rpc } = fakeClient();
      const calls = [
        () => createOrganizationPeriod(client, { name: "2026/2027", start_date: "2026-08-01", end_date: "2027-07-31" }),
        () => updateOrganizationPeriod(client, PERIOD_ID, { name: "2026/2027 Rev" }),
        () => activateOrganizationPeriod(client, PERIOD_ID),
        () => endOrganizationPeriod(client, PERIOD_ID),
        () => deleteOrganizationPeriod(client, PERIOD_ID),
        () => createDepartment(client, { name: "Web Dev", slug: "web-dev" }),
        () => updateDepartment(client, DEPT_ID, { name: "Web Dev 2" }),
        () => setDepartmentActive(client, DEPT_ID, false),
        () => deleteDepartment(client, DEPT_ID),
        () => createPosition(client, { name: "President", level: "CORE" }),
        () => updatePosition(client, POS_ID, { display_order: 2 }),
        () => setPositionActive(client, POS_ID, false),
        () => deletePosition(client, POS_ID),
        () =>
          assignMembershipHistory(client, {
            member_id: MEMBER_ID,
            organization_period_id: PERIOD_ID,
            department_id: DEPT_ID,
            position_id: POS_ID,
            start_date: "2026-08-15",
          }),
        () => endMembershipHistory(client, HISTORY_ID, { end_date: "2026-12-31" }),
      ];

      for (const invoke of calls) {
        requireAdmin.mockRejectedValueOnce(new AppError("FORBIDDEN"));
        const res = await invoke();
        expect(res).toEqual({
          ok: false,
          error: { code: "FORBIDDEN", message: "Akses tidak diizinkan." },
        });
      }
      expect(rpc).not.toHaveBeenCalled();
    });
  });

  describe("organization periods", () => {
    it("creates a period via audited RPC and returns UTC timestamps", async () => {
      const { client, rpc } = fakeClient(ok({ ...periodRow, extra: "drop" }));
      const res = await createOrganizationPeriod(client, {
        name: " 2026/2027 ",
        start_date: "2026-08-01",
        end_date: "2027-07-31",
      });

      expect(requireAdmin).toHaveBeenCalledWith(client);
      expect(rpc).toHaveBeenCalledWith("admin_create_organization_period", {
        p_values: {
          name: "2026/2027",
          start_date: "2026-08-01",
          end_date: "2027-07-31",
        },
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).not.toHaveProperty("extra");
        expect(res.data.created_at).toBe("2026-11-27T02:00:00.123Z");
        expect(res.data.updated_at).toBe("2026-11-27T02:00:00.000Z");
      }
    });

    it("rejects end_date < start_date before RPC and maps DB 23514 on partial update", async () => {
      const { client, rpc } = fakeClient();
      const badCreate = await createOrganizationPeriod(client, {
        name: "2026/2027",
        start_date: "2027-08-01",
        end_date: "2026-07-31",
      });
      expect(badCreate.ok).toBe(false);
      if (!badCreate.ok) {
        expect(badCreate.error.code).toBe("VALIDATION_ERROR");
        expect(badCreate.error.field_errors?.end_date).toBeDefined();
      }
      expect(rpc).not.toHaveBeenCalled();

      const { client: dbFailClient } = fakeClient(
        fail("23514", "end_date harus setelah atau sama dengan start_date"),
      );
      const badPartial = await updateOrganizationPeriod(dbFailClient, PERIOD_ID, {
        end_date: "2026-01-01",
      });
      expect(badPartial.ok).toBe(false);
      if (!badPartial.ok) {
        expect(badPartial.error.code).toBe("VALIDATION_ERROR");
        expect(badPartial.error.field_errors?.end_date).toBeDefined();
      }
    });

    it("updates, activates, ends, and deletes a period with error mapping", async () => {
      const { client: updClient, rpc: updRpc } = fakeClient(
        ok({ ...periodRow, name: "2026/2027 Rev" }),
      );
      const upd = await updateOrganizationPeriod(updClient, PERIOD_ID, {
        name: "2026/2027 Rev",
      });
      expect(upd.ok).toBe(true);
      expect(updRpc).toHaveBeenCalledWith("admin_update_organization_period", {
        p_id: PERIOD_ID,
        p_changes: { name: "2026/2027 Rev" },
      });

      const { client: actClient, rpc: actRpc } = fakeClient(
        ok({ ...periodRow, status: "ACTIVE" }),
      );
      const act = await activateOrganizationPeriod(actClient, PERIOD_ID);
      expect(act.ok).toBe(true);
      expect(actRpc).toHaveBeenCalledWith("admin_activate_organization_period", {
        p_id: PERIOD_ID,
      });

      const { client: conflictClient } = fakeClient(
        fail("P0001", "Sudah ada periode organisasi yang aktif"),
      );
      const conflict = await activateOrganizationPeriod(conflictClient, PERIOD_ID);
      expect(conflict).toMatchObject({ ok: false, error: { code: "CONFLICT" } });

      const { client: endClient, rpc: endRpc } = fakeClient(
        ok({ ...periodRow, status: "ENDED" }),
      );
      const ended = await endOrganizationPeriod(endClient, PERIOD_ID);
      expect(ended.ok).toBe(true);
      expect(endRpc).toHaveBeenCalledWith("admin_end_organization_period", {
        p_id: PERIOD_ID,
      });

      const { client: delClient, rpc: delRpc } = fakeClient(
        ok({ id: PERIOD_ID, deleted: true }),
      );
      const deleted = await deleteOrganizationPeriod(delClient, PERIOD_ID);
      expect(deleted).toEqual({ ok: true, data: { id: PERIOD_ID, deleted: true } });
      expect(delRpc).toHaveBeenCalledWith("admin_delete_organization_period", {
        p_id: PERIOD_ID,
      });

      const { client: guardClient } = fakeClient(fail("23001"));
      const guarded = await deleteOrganizationPeriod(guardClient, PERIOD_ID);
      expect(guarded).toMatchObject({ ok: false, error: { code: "CONFLICT" } });
    });

    it("rejects malformed UUID id as NOT_FOUND without calling RPC", async () => {
      const { client, rpc } = fakeClient();
      expect(await updateOrganizationPeriod(client, "bad-id", { name: "X" })).toMatchObject({
        ok: false,
        error: { code: "NOT_FOUND" },
      });
      expect(await activateOrganizationPeriod(client, "bad-id")).toMatchObject({
        ok: false,
        error: { code: "NOT_FOUND" },
      });
      expect(await endOrganizationPeriod(client, "bad-id")).toMatchObject({
        ok: false,
        error: { code: "NOT_FOUND" },
      });
      expect(await deleteOrganizationPeriod(client, "bad-id")).toMatchObject({
        ok: false,
        error: { code: "NOT_FOUND" },
      });
      expect(rpc).not.toHaveBeenCalled();
    });
  });

  describe("departments", () => {
    it("creates, updates, toggles active, and deletes departments", async () => {
      const { client: cClient, rpc: cRpc } = fakeClient(ok(departmentRow));
      const created = await createDepartment(cClient, {
        name: " Web Development ",
        slug: "web-development",
        display_order: 3,
      });
      expect(created.ok).toBe(true);
      expect(cRpc).toHaveBeenCalledWith("admin_create_department", {
        p_values: {
          name: "Web Development",
          slug: "web-development",
          display_order: 3,
          active: true,
        },
      });

      const { client: uClient, rpc: uRpc } = fakeClient(
        ok({ ...departmentRow, display_order: 10 }),
      );
      const updated = await updateDepartment(uClient, DEPT_ID, { display_order: 10 });
      expect(updated.ok).toBe(true);
      expect(uRpc).toHaveBeenCalledWith("admin_update_department", {
        p_id: DEPT_ID,
        p_changes: { display_order: 10 },
      });

      const { client: tClient, rpc: tRpc } = fakeClient(
        ok({ ...departmentRow, active: false }),
      );
      const toggled = await setDepartmentActive(tClient, DEPT_ID, false);
      expect(toggled.ok).toBe(true);
      expect(tRpc).toHaveBeenCalledWith("admin_update_department", {
        p_id: DEPT_ID,
        p_changes: { active: false },
      });

      const { client: dClient, rpc: dRpc } = fakeClient(
        ok({ id: DEPT_ID, deleted: true }),
      );
      const deleted = await deleteDepartment(dClient, DEPT_ID);
      expect(deleted).toEqual({ ok: true, data: { id: DEPT_ID, deleted: true } });
      expect(dRpc).toHaveBeenCalledWith("admin_delete_department", { p_id: DEPT_ID });
    });

    it("maps duplicate department slug (23505) to CONFLICT with slug field_errors", async () => {
      const dupCreate = await createDepartment(fakeClient(fail("23505")).client, {
        name: "Web Dev",
        slug: "web-dev",
      });
      expect(dupCreate).toMatchObject({
        ok: false,
        error: { code: "CONFLICT", field_errors: { slug: ["Slug sudah dipakai."] } },
      });

      const dupUpdate = await updateDepartment(fakeClient(fail("23505")).client, DEPT_ID, {
        slug: "web-dev",
      });
      expect(dupUpdate).toMatchObject({
        ok: false,
        error: { code: "CONFLICT", field_errors: { slug: ["Slug sudah dipakai."] } },
      });
    });

    it("rejects non-boolean active in setDepartmentActive before RPC", async () => {
      const { client, rpc } = fakeClient();
      const res = await setDepartmentActive(
        client,
        DEPT_ID,
        "false" as unknown as boolean,
      );
      expect(res).toMatchObject({ ok: false, error: { code: "VALIDATION_ERROR" } });
      expect(rpc).not.toHaveBeenCalled();
    });
  });

  describe("positions", () => {
    it("creates, updates, toggles active, and deletes positions", async () => {
      const { client: cClient, rpc: cRpc } = fakeClient(ok(positionRow));
      const created = await createPosition(cClient, {
        name: "Coordinator",
        level: "COORDINATOR",
        display_order: 6,
      });
      expect(created.ok).toBe(true);
      expect(cRpc).toHaveBeenCalledWith("admin_create_position", {
        p_values: {
          name: "Coordinator",
          level: "COORDINATOR",
          display_order: 6,
          active: true,
        },
      });

      const { client: uClient, rpc: uRpc } = fakeClient(
        ok({ ...positionRow, display_order: 2 }),
      );
      const updated = await updatePosition(uClient, POS_ID, { display_order: 2 });
      expect(updated.ok).toBe(true);
      expect(uRpc).toHaveBeenCalledWith("admin_update_position", {
        p_id: POS_ID,
        p_changes: { display_order: 2 },
      });

      const { client: tClient, rpc: tRpc } = fakeClient(
        ok({ ...positionRow, active: false }),
      );
      const toggled = await setPositionActive(tClient, POS_ID, false);
      expect(toggled.ok).toBe(true);
      expect(tRpc).toHaveBeenCalledWith("admin_update_position", {
        p_id: POS_ID,
        p_changes: { active: false },
      });

      const { client: dClient, rpc: dRpc } = fakeClient(
        ok({ id: POS_ID, deleted: true }),
      );
      const deleted = await deletePosition(dClient, POS_ID);
      expect(deleted).toEqual({ ok: true, data: { id: POS_ID, deleted: true } });
      expect(dRpc).toHaveBeenCalledWith("admin_delete_position", { p_id: POS_ID });
    });

    it("rejects non-canonical position levels before RPC", async () => {
      const { client, rpc } = fakeClient();
      const res = await createPosition(client, { name: "VP", level: "VICE_PRESIDENT" });
      expect(res).toMatchObject({ ok: false, error: { code: "VALIDATION_ERROR" } });
      expect(rpc).not.toHaveBeenCalled();
    });
  });

  describe("membership histories", () => {
    it("assigns a member placement via audited RPC and normalizes timestamps", async () => {
      const { client, rpc } = fakeClient(ok(historyRow));
      const res = await assignMembershipHistory(client, {
        member_id: MEMBER_ID,
        organization_period_id: PERIOD_ID,
        department_id: DEPT_ID,
        position_id: POS_ID,
        start_date: "2026-08-15",
        notes: " Penempatan awal ",
      });

      expect(rpc).toHaveBeenCalledWith("admin_assign_membership_history", {
        p_values: {
          member_id: MEMBER_ID,
          organization_period_id: PERIOD_ID,
          department_id: DEPT_ID,
          position_id: POS_ID,
          start_date: "2026-08-15",
          notes: "Penempatan awal",
        },
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.created_at).toBe("2026-11-27T02:00:00.123Z");
      }
    });

    it("maps D24 missing department check violation (23514) to department_id field_errors", async () => {
      const { client } = fakeClient(
        fail("23514", "Posisi level MEMBER wajib memiliki departemen"),
      );
      const res = await assignMembershipHistory(client, {
        member_id: MEMBER_ID,
        organization_period_id: PERIOD_ID,
        department_id: null,
        position_id: POS_ID,
        start_date: "2026-08-15",
      });
      expect(res).toEqual({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Periksa kembali data yang diisi.",
          field_errors: {
            department_id: [
              "Posisi selain pengurus inti dan advisor wajib memiliki departemen.",
            ],
          },
        },
      });
    });

    it("ends a membership placement and handles notes semantics (omit vs clear vs update)", async () => {
      const { client: c1, rpc: r1 } = fakeClient(
        ok({ ...historyRow, end_date: "2026-12-31" }),
      );
      const res1 = await endMembershipHistory(c1, HISTORY_ID, {
        end_date: "2026-12-31",
      });
      expect(res1.ok).toBe(true);
      expect(r1).toHaveBeenCalledWith("admin_end_membership_history", {
        p_id: HISTORY_ID,
        p_end_date: "2026-12-31",
      });

      const { client: c2, rpc: r2 } = fakeClient(
        ok({ ...historyRow, end_date: "2026-12-31", notes: null }),
      );
      const res2 = await endMembershipHistory(c2, HISTORY_ID, {
        end_date: "2026-12-31",
        notes: null,
      });
      expect(res2.ok).toBe(true);
      expect(r2).toHaveBeenCalledWith("admin_end_membership_history", {
        p_id: HISTORY_ID,
        p_end_date: "2026-12-31",
        p_notes: "",
      });

      const { client: c3, rpc: r3 } = fakeClient(
        ok({ ...historyRow, end_date: "2026-12-31", notes: "Pindah divisi" }),
      );
      const res3 = await endMembershipHistory(c3, HISTORY_ID, {
        end_date: "2026-12-31",
        notes: " Pindah divisi ",
      });
      expect(res3.ok).toBe(true);
      expect(r3).toHaveBeenCalledWith("admin_end_membership_history", {
        p_id: HISTORY_ID,
        p_end_date: "2026-12-31",
        p_notes: "Pindah divisi",
      });
    });

    it("maps end_date < start_date (23514), missing row (P0002), and unexpected payload (503)", async () => {
      const badDate = await endMembershipHistory(
        fakeClient(fail("23514", "end_date harus setelah atau sama dengan start_date")).client,
        HISTORY_ID,
        { end_date: "2026-08-01" },
      );
      expect(badDate).toMatchObject({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          field_errors: {
            end_date: ["end_date harus setelah atau sama dengan start_date."],
          },
        },
      });

      const missing = await endMembershipHistory(
        fakeClient(fail("P0002")).client,
        HISTORY_ID,
        { end_date: "2026-12-31" },
      );
      expect(missing).toMatchObject({ ok: false, error: { code: "NOT_FOUND" } });

      const malformed = await endMembershipHistory(
        fakeClient(ok({ id: HISTORY_ID })).client,
        HISTORY_ID,
        { end_date: "2026-12-31" },
      );
      expect(malformed).toMatchObject({
        ok: false,
        error: { code: "SERVICE_UNAVAILABLE" },
      });
    });
  });
});
