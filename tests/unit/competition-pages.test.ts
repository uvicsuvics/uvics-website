import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import NotFound from "@/app/(public)/not-found";
import CompetitionsPage from "@/app/(public)/competitions/page";
import { CompetitionCard } from "@/components/competitions/competition-card";
import { CompetitionDetailContent } from "@/components/competitions/CompetitionDetailContent";
import { UVICS_COMPETITIONS } from "@/data/mock/competitions";
import * as competitionService from "@/lib/services/competitionService";
import type { Competition } from "@/types/competition";

vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/competitions",
}));

afterEach(() => vi.restoreAllMocks());

describe("halaman /competitions", () => {
  it("hanya menampilkan kartu berstatus yang difilter", async () => {
    // Label status tidak dipakai sebagai bukti karena chip filter merender semua label.
    const html = renderToStaticMarkup(await CompetitionsPage({ searchParams: Promise.resolve({ status: "OPEN" }) }));
    const finished = UVICS_COMPETITIONS.find(({ status, featured }) => status === "FINISHED" && !featured)!;
    expect(html).not.toContain(`href="/competitions/${finished.slug}"`);
    expect(html).toContain(`href="/competitions/${UVICS_COMPETITIONS.find(({ status }) => status === "OPEN")!.slug}"`);
  });

  it("menampilkan empty state filter dengan tombol reset", async () => {
    const html = renderToStaticMarkup(await CompetitionsPage({ searchParams: Promise.resolve({ search: "tidakadayangcocok" }) }));
    expect(html).toContain("Belum ada kompetisi untuk filter yang dipilih.");
    expect(html).toContain('href="/competitions#semua-kompetisi"');
  });

  it("tautan pagination mempertahankan filter", async () => {
    const real = competitionService.getCompetitions;
    vi.spyOn(competitionService, "getCompetitions").mockImplementation(async (query) => {
      const result = await real(query);
      return query?.featured ? result : { ...result, pagination: { page: 1, page_size: 6, total_items: 14, total_pages: 3 } };
    });
    const html = renderToStaticMarkup(await CompetitionsPage({ searchParams: Promise.resolve({ search: "ai", status: "OPEN" }) }));
    expect(html).toContain('href="/competitions?search=ai&amp;status=OPEN&amp;page=2#semua-kompetisi"');
  });

  it("parameter rusak jatuh ke default, halaman di luar total menjadi 404", async () => {
    await expect(CompetitionsPage({ searchParams: Promise.resolve({ page: "abc", status: "foo" }) })).resolves.toBeTruthy();
    await expect(CompetitionsPage({ searchParams: Promise.resolve({ page: "99" }) })).rejects.toMatchObject({
      digest: expect.stringContaining("404"),
    });
  });
});

describe("komponen kompetisi", () => {
  it("kartu dan detail aman untuk field nullable", () => {
    const competition: Competition = {
      id: "x", slug: "x", title: "Judul X", organizer: "Penyelenggara X", description: "Deskripsi X",
      category: null, level: null, registrationDeadline: null, competitionDate: null,
      registrationUrl: null, guidebookUrl: null, poster: null, teamSize: null, eligibility: null,
      status: "OPEN", featured: false,
    };
    for (const html of [
      renderToStaticMarkup(createElement(CompetitionCard, { competition })),
      renderToStaticMarkup(createElement(CompetitionDetailContent, { competition })),
    ]) {
      expect(html).not.toMatch(/undefined|>null<|Invalid Date/);
    }
  });
});

describe("not-found publik", () => {
  it("menampilkan satu h1 dan tautan kembali ke beranda", () => {
    const html = renderToStaticMarkup(createElement(NotFound));
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("Halaman tidak ditemukan");
    expect(html).toContain('href="/"');
  });
});
