import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { DepartmentStructure, groupByPosition } from "@/components/departments/DepartmentStructure";
import type { PublicMember } from "@/lib/backend/dto";

const member = (name: string, position: string): PublicMember => ({
  name,
  photo: null,
  position,
  department: "Web Development",
});

describe("struktur pengurus departemen", () => {
  it("mengelompokkan pengurus per posisi dengan urutan resmi dan posisi lain di akhir", () => {
    const levels = groupByPosition([
      member("Ana", "Anggota"),
      member("Pia", "PIC"),
      member("Lain", "Bendahara Departemen"),
      member("Kori", "Koordinator"),
      member("Budi", "Anggota"),
      member("Stev", "Steering Helper"),
      member("Pio", "PIC"),
    ]);

    expect(levels.map((level) => level.position)).toEqual([
      "Steering Helper",
      "Koordinator",
      "PIC",
      "Anggota",
      "Bendahara Departemen",
    ]);
    expect(levels[2].members.map((m) => m.name)).toEqual(["Pia", "Pio"]);
    expect(levels[3].members.map((m) => m.name)).toEqual(["Ana", "Budi"]);
  });

  it("menampilkan setiap level sebagai bagan bernama dan anggota dalam satu daftar", () => {
    const html = renderToStaticMarkup(
      createElement(DepartmentStructure, {
        label: "Struktur pengurus Web Development",
        members: [member("Stev", "Steering Helper"), member("Ana", "Anggota"), member("Budi", "Anggota")],
      }),
    );

    expect(html).toMatch(/<ol[^>]*aria-label="Struktur pengurus Web Development"/);
    expect(html.indexOf(">Steering Helper<")).toBeLessThan(html.indexOf(">Anggota<"));
    const anggota = html.slice(html.indexOf(">Anggota<"));
    expect(anggota.indexOf(">Ana<")).toBeGreaterThan(-1);
    expect(anggota.indexOf(">Budi<")).toBeGreaterThan(anggota.indexOf(">Ana<"));
  });
});
