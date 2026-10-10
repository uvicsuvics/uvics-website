import { describe, expect, it } from "vitest";
import {
  PUBLIC_NAVIGATION,
  isPublicNavItemActive,
} from "@/config/public-navigation";

describe("public navigation configuration and active link helpers", () => {
  it("contains all required navigation items without standalone Informasi", () => {
    const itemNames = PUBLIC_NAVIGATION.map((item) => item.name);
    expect(itemNames).toEqual([
      "Beranda",
      "Tentang",
      "Organisasi",
      "Program",
      "Kompetisi",
      "Prestasi",
      "Project",
    ]);
  });

  it("configures Tentang with two-column layout containing Profil and Aktivitas & Media", () => {
    const tentang = PUBLIC_NAVIGATION.find((item) => item.name === "Tentang");
    expect(tentang?.layout).toBe("two-column");

    const profilItems = tentang?.subItems?.filter(
      (s) => s.group === "Profil Organisasi"
    );
    expect(profilItems?.map((s) => s.title)).toEqual([
      "Tentang UVICS",
      "Visi & Misi",
      "Departemen",
    ]);

    const aktivitasItems = tentang?.subItems?.filter(
      (s) => s.group === "Aktivitas & Media"
    );
    expect(aktivitasItems?.map((s) => s.title)).toEqual([
      "Event",
      "Berita",
      "Galeri",
    ]);
  });

  it("configures Organisasi with single-column layout and correct sub-items", () => {
    const organisasi = PUBLIC_NAVIGATION.find((item) => item.name === "Organisasi");
    expect(organisasi?.layout).toBe("single-column");
    expect(organisasi?.subItems?.map((s) => s.title)).toEqual([
      "Struktur Organisasi",
      "Member",
      "Alumni",
    ]);
  });

  describe("isPublicNavItemActive", () => {
    const berandaItem = PUBLIC_NAVIGATION.find((i) => i.name === "Beranda")!;
    const tentangItem = PUBLIC_NAVIGATION.find((i) => i.name === "Tentang")!;
    const kompetisiItem = PUBLIC_NAVIGATION.find((i) => i.name === "Kompetisi")!;

    it("activates Beranda only on exact root path", () => {
      expect(isPublicNavItemActive("/", berandaItem)).toBe(true);
      expect(isPublicNavItemActive("/about", berandaItem)).toBe(false);
      expect(isPublicNavItemActive("/competitions", berandaItem)).toBe(false);
    });

    it("activates single route items on exact or nested path", () => {
      expect(isPublicNavItemActive("/competitions", kompetisiItem)).toBe(true);
      expect(isPublicNavItemActive("/competitions/gemastik-2026", kompetisiItem)).toBe(true);
      expect(isPublicNavItemActive("/events", kompetisiItem)).toBe(false);
    });

    it("activates Tentang for both Profil and merged Aktivitas routes", () => {
      // Profil routes
      expect(isPublicNavItemActive("/about", tentangItem)).toBe(true);
      expect(isPublicNavItemActive("/departments", tentangItem)).toBe(true);
      expect(isPublicNavItemActive("/departments/web-development", tentangItem)).toBe(true);

      // Merged Aktivitas/Media routes
      expect(isPublicNavItemActive("/events", tentangItem)).toBe(true);
      expect(isPublicNavItemActive("/events/workshop-ai", tentangItem)).toBe(true);
      expect(isPublicNavItemActive("/news", tentangItem)).toBe(true);
      expect(isPublicNavItemActive("/news/artikel-terbaru", tentangItem)).toBe(true);
      expect(isPublicNavItemActive("/gallery", tentangItem)).toBe(true);

      // Unrelated route
      expect(isPublicNavItemActive("/programs", tentangItem)).toBe(false);
    });
  });
});
