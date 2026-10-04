import { describe, expect, it } from "vitest";
import {
  PUBLIC_NAVIGATION,
  isPublicNavItemActive,
} from "@/config/public-navigation";

describe("public navigation configuration and active link helpers", () => {
  it("contains all required navigation items matching PRD Bab 2", () => {
    const itemNames = PUBLIC_NAVIGATION.map((item) => item.name);
    expect(itemNames).toEqual([
      "Beranda",
      "Tentang",
      "Organisasi",
      "Program",
      "Kompetisi",
      "Prestasi",
      "Project",
      "Informasi",
    ]);
  });

  it("configures the 3 PRD dropdown groups with correct sub-items", () => {
    const tentang = PUBLIC_NAVIGATION.find((item) => item.name === "Tentang");
    expect(tentang?.subItems?.map((s) => s.title)).toEqual([
      "Tentang UVICS",
      "Visi & Misi",
      "Departemen",
    ]);

    const organisasi = PUBLIC_NAVIGATION.find((item) => item.name === "Organisasi");
    expect(organisasi?.subItems?.map((s) => s.title)).toEqual([
      "Struktur Organisasi",
      "Member",
      "Alumni",
    ]);

    const informasi = PUBLIC_NAVIGATION.find((item) => item.name === "Informasi");
    expect(informasi?.subItems?.map((s) => s.title)).toEqual([
      "Event",
      "Berita",
      "Galeri",
    ]);
  });

  describe("isPublicNavItemActive", () => {
    const berandaItem = PUBLIC_NAVIGATION.find((i) => i.name === "Beranda")!;
    const tentangItem = PUBLIC_NAVIGATION.find((i) => i.name === "Tentang")!;
    const kompetisiItem = PUBLIC_NAVIGATION.find((i) => i.name === "Kompetisi")!;
    const informasiItem = PUBLIC_NAVIGATION.find((i) => i.name === "Informasi")!;

    it("activates Beranda only when exact root path", () => {
      expect(isPublicNavItemActive("/", berandaItem)).toBe(true);
      expect(isPublicNavItemActive("/about", berandaItem)).toBe(false);
      expect(isPublicNavItemActive("/competitions", berandaItem)).toBe(false);
    });

    it("activates single route items on exact or nested path", () => {
      expect(isPublicNavItemActive("/competitions", kompetisiItem)).toBe(true);
      expect(isPublicNavItemActive("/competitions/gemastik-2026", kompetisiItem)).toBe(true);
      expect(isPublicNavItemActive("/events", kompetisiItem)).toBe(false);
    });

    it("activates dropdown parent when any subItem matches", () => {
      expect(isPublicNavItemActive("/about", tentangItem)).toBe(true);
      expect(isPublicNavItemActive("/departments", tentangItem)).toBe(true);
      expect(isPublicNavItemActive("/departments/web-development", tentangItem)).toBe(true);
      expect(isPublicNavItemActive("/organization", tentangItem)).toBe(false);

      expect(isPublicNavItemActive("/events", informasiItem)).toBe(true);
      expect(isPublicNavItemActive("/news", informasiItem)).toBe(true);
      expect(isPublicNavItemActive("/gallery", informasiItem)).toBe(true);
      expect(isPublicNavItemActive("/competitions", informasiItem)).toBe(false);
    });
  });
});
