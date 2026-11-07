import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CompetitionsSection } from "@/components/sections/CompetitionsSection";
import { UVICS_COMPETITIONS } from "@/data/mock/competitions";
import {
  getCompetitionBySlug,
  getCompetitions,
  getRelatedCompetitions,
} from "@/lib/services/competitionService";
import { Constants } from "@/types/database";
import type { Competition } from "@/types/competition";

describe("competition service", () => {
  it("mengembalikan DTO dan meta pagination kontrak backend", async () => {
    const result = await getCompetitions({ page_size: 2 });
    expect(result.items).toHaveLength(2);
    expect(result.pagination).toEqual({
      page: 1,
      page_size: 2,
      total_items: UVICS_COMPETITIONS.length,
      total_pages: Math.ceil(UVICS_COMPETITIONS.length / 2),
    });
  });

  it("mencari judul dan penyelenggara seperti backend", async () => {
    // Satu kata tanpa tanda baca; karakter seperti "(" ikut dibuang normalizeSearch.
    const target = UVICS_COMPETITIONS[0];
    const word = target.title.split(" ")[0];
    const { items } = await getCompetitions({ search: `${word.toUpperCase()}%`, page_size: 100 });
    expect(items.map(({ id }) => id)).toContain(target.id);
    expect((await getCompetitions({ search: "hackathon", page_size: 100 })).items.length).toBeGreaterThan(0);
  });

  it("memfilter status dan featured", async () => {
    const { items } = await getCompetitions({ status: "OPEN", page_size: 100 });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every(({ status }) => status === "OPEN")).toBe(true);
    expect((await getCompetitions({ featured: true, page_size: 1 })).items[0]?.featured).toBe(true);
  });

  it("404 untuk halaman di luar total, tetapi halaman 1 kosong tetap valid", async () => {
    await expect(getCompetitions({ page: 99, page_size: 6 })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(getCompetitions({ search: "tidakadayangcocok" })).resolves.toMatchObject({
      items: [],
      pagination: { total_items: 0 },
    });
  });

  it("detail null untuk slug tidak dikenal, dan kompetisi terkait tanpa dirinya sendiri", async () => {
    expect(await getCompetitionBySlug("tidak-ada")).toBeNull();
    const slug = UVICS_COMPETITIONS[0].slug;
    const related = await getRelatedCompetitions(slug);
    expect(related.length).toBeLessThanOrEqual(3);
    expect(related.map((c) => c.slug)).not.toContain(slug);
  });

  it("mock hanya berisi field DTO, kode enum DB, dan tanggal YYYY-MM-DD", () => {
    const keys = ["category", "competitionDate", "description", "eligibility", "featured", "guidebookUrl", "id", "level", "organizer", "poster", "registrationDeadline", "registrationUrl", "slug", "status", "teamSize", "title"];
    for (const c of UVICS_COMPETITIONS) {
      expect(Object.keys(c).sort()).toEqual(keys);
      expect(Constants.public.Enums.competition_status).toContain(c.status);
      if (c.level) expect(Constants.public.Enums.content_level).toContain(c.level);
      for (const d of [c.registrationDeadline, c.competitionDate]) if (d) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("CompetitionsSection", () => {
  it("aman untuk field nullable", () => {
    const fixture: Competition = {
      id: "x", slug: "x", title: "Judul X", organizer: "Penyelenggara X", description: "Deskripsi X",
      category: null, level: null, registrationDeadline: null, competitionDate: null,
      registrationUrl: null, guidebookUrl: null, poster: null, teamSize: null, eligibility: null,
      status: "OPEN", featured: false,
    };
    const html = renderToStaticMarkup(createElement(CompetitionsSection, { competitions: [fixture] }));
    expect(html).toContain("Belum ditentukan");
    expect(html).not.toMatch(/undefined|null|Invalid Date/);
  });
});
