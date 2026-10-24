import { describe, expect, it } from "vitest";
import {
  ADMIN_NAVIGATION,
  isAdminNavItemActive,
  getAdminBreadcrumbs,
} from "@/config/admin-navigation";

describe("admin navigation configuration & helpers", () => {
  it("uses canonical /admin/organization-periods and has no legacy /admin/periods", () => {
    const allHrefs = ADMIN_NAVIGATION.flatMap((section) =>
      section.items.map((item) => item.href)
    );
    expect(allHrefs).toContain("/admin/organization-periods");
    expect(allHrefs).not.toContain("/admin/periods");
  });

  it("ensures all navigation items have valid admin hrefs", () => {
    for (const section of ADMIN_NAVIGATION) {
      for (const item of section.items) {
        expect(item.href).toMatch(/^\/admin\/[a-z-]+$/);
        expect(item.title).toBeTruthy();
        expect(item.icon).toBeDefined();
      }
    }
  });

  describe("isAdminNavItemActive", () => {
    it("matches exact pathname", () => {
      expect(isAdminNavItemActive("/admin/dashboard", "/admin/dashboard")).toBe(true);
      expect(isAdminNavItemActive("/admin/news", "/admin/news")).toBe(true);
      expect(isAdminNavItemActive("/admin/organization-periods", "/admin/organization-periods")).toBe(true);
    });

    it("matches nested child routes", () => {
      expect(isAdminNavItemActive("/admin/news/create", "/admin/news")).toBe(true);
      expect(isAdminNavItemActive("/admin/news/slug-example/edit", "/admin/news")).toBe(true);
      expect(isAdminNavItemActive("/admin/members/123", "/admin/members")).toBe(true);
      expect(isAdminNavItemActive("/admin/organization-periods/2026-2027", "/admin/organization-periods")).toBe(true);
    });

    it("does not false-positive match prefix-overlapping sibling routes", () => {
      expect(isAdminNavItemActive("/admin/newsletter", "/admin/news")).toBe(false);
      expect(isAdminNavItemActive("/admin/pages-draft", "/admin/pages")).toBe(false);
      expect(isAdminNavItemActive("/admin/membership-card", "/admin/members")).toBe(false);
    });

    it("returns false for completely different routes", () => {
      expect(isAdminNavItemActive("/admin/events", "/admin/news")).toBe(false);
      expect(isAdminNavItemActive("/admin/dashboard", "/admin/settings")).toBe(false);
    });
  });

  describe("getAdminBreadcrumbs", () => {
    it("returns breadcrumbs for /admin/dashboard", () => {
      const crumbs = getAdminBreadcrumbs("/admin/dashboard");
      expect(crumbs).toEqual([
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Dashboard", href: "/admin/dashboard", isCurrent: true },
      ]);
    });

    it("returns breadcrumbs for exact module route", () => {
      const crumbs = getAdminBreadcrumbs("/admin/news");
      expect(crumbs).toEqual([
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Berita", href: "/admin/news", isCurrent: true },
      ]);
    });

    it("returns breadcrumbs for canonical organization-periods", () => {
      const crumbs = getAdminBreadcrumbs("/admin/organization-periods");
      expect(crumbs).toEqual([
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Periode Organisasi", href: "/admin/organization-periods", isCurrent: true },
      ]);
    });

    it("returns breadcrumbs for nested CRUD action route", () => {
      const crumbs = getAdminBreadcrumbs("/admin/news/create");
      expect(crumbs).toEqual([
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Berita", href: "/admin/news" },
        { label: "Tambah", href: "/admin/news/create", isCurrent: true },
      ]);
    });

    it("returns human-readable segments for multi-nested edit route", () => {
      const crumbs = getAdminBreadcrumbs("/admin/members/123/edit");
      expect(crumbs).toEqual([
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Anggota", href: "/admin/members" },
        { label: "123", href: "/admin/members/123", isCurrent: false },
        { label: "Edit", href: "/admin/members/123/edit", isCurrent: true },
      ]);
    });

    it("returns breadcrumbs for settings and audit-logs", () => {
      expect(getAdminBreadcrumbs("/admin/settings")).toEqual([
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Pengaturan Website", href: "/admin/settings", isCurrent: true },
      ]);
      expect(getAdminBreadcrumbs("/admin/audit-logs")).toEqual([
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Log Audit", href: "/admin/audit-logs", isCurrent: true },
      ]);
    });
  });
});
