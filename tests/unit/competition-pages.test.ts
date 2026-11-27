import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import NotFound from "@/app/(public)/not-found";
import CompetitionDetailPage from "@/app/(public)/competitions/[slug]/page";
import CompetitionsPage from "@/app/(public)/competitions/page";
import { CompetitionDetailContent } from "@/components/competitions/CompetitionDetailContent";
import { CompetitionDetailHeader } from "@/components/competitions/CompetitionDetailHeader";
import { competitionDates } from "@/components/competitions/DateTile";
import { UVICS_COMPETITIONS } from "@/data/mock/competitions";
import type { Competition } from "@/types/competition";

vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/competitions",
}));


const render = async (params: Record<string, string>) =>
  renderToStaticMarkup(await CompetitionsPage({ searchParams: Promise.resolve(params) }));
const slugOf = (match: (c: Competition) => boolean) => UVICS_COMPETITIONS.find(match)!.slug;
// Daftar dimulai dari ringkasan hasil; header dan banner unggulan juga menaut ke detail kompetisi.
const listOf = (html: string) => html.slice(html.indexOf('aria-live="polite"'));

describe("halaman /competitions", () => {
  it("menampilkan grup aktif berurutan dan menyimpan arsip di balik details", async () => {
    const html = await render({});
    const open = html.indexOf(">Pendaftaran Dibuka</h2>");
    const upcoming = html.indexOf(">Segera Dibuka</h2>");
    const ongoing = html.indexOf(">Sedang Berlangsung</h2>");
    expect(open).toBeGreaterThan(-1);
    expect(open).toBeLessThan(upcoming);
    expect(upcoming).toBeLessThan(ongoing);
    const archived = UVICS_COMPETITIONS.filter((c) => c.status === "CLOSED" || c.status === "FINISHED").length;
    expect(html).toMatch(new RegExp(`Kompetisi yang sudah ditutup atau selesai \\((<!-- -->)?${archived}(<!-- -->)?\\)`));
    expect(html.indexOf("<details")).toBeLessThan(html.indexOf(`href="/competitions/${slugOf((c) => c.status === "FINISHED")}"`));
    expect(html).not.toMatch(/<details[^>]*open/);
  });

  it("membuka arsip bila hanya arsip yang cocok", async () => {
    const finished = UVICS_COMPETITIONS.find((c) => c.status === "FINISHED")!;
    const html = await render({ search: finished.title });
    expect(html).toMatch(/<details[^>]*open/);
    expect(html).toContain(`href="/competitions/${finished.slug}"`);
  });

  it("filter kategori hanya menampilkan kategori itu", async () => {
    const list = listOf(await render({ category: "Hackathon" }));
    for (const c of UVICS_COMPETITIONS) {
      const linked = list.includes(`href="/competitions/${c.slug}"`);
      expect(linked).toBe(c.category === "Hackathon");
    }
  });

  it("filter status hanya menampilkan grup itu dan membuka arsip yang dipilih", async () => {
    const html = await render({ status: "CLOSED" });
    expect(html).toContain(">Pendaftaran Ditutup</h2>");
    expect(html).not.toContain(">Pendaftaran Dibuka</h2>");
    expect(html).not.toContain("<details");
    expect(listOf(html)).not.toContain(`href="/competitions/${slugOf((c) => c.status === "OPEN" && !c.featured)}"`);
  });

  it("menyembunyikan kompetisi unggulan saat filter aktif", async () => {
    const featured = slugOf((c) => c.featured);
    expect((await render({})).match(new RegExp(`href="/competitions/${featured}"`, "g"))!.length).toBeGreaterThan(1);
    expect((await render({ level: "INTERNASIONAL" }))).not.toContain(`href="/competitions/${featured}"`);
  });

  it("menampilkan empty state filter dengan tombol reset", async () => {
    const html = await render({ search: "tidakadayangcocok" });
    expect(html).toContain("Belum ada kompetisi untuk filter yang dipilih.");
    expect(html).toContain('href="/competitions"');
  });

  it("parameter rusak jatuh ke default", async () => {
    const html = await render({ status: "foo", level: "bar", category: "tidak-ada", page: "abc" });
    expect(html).toContain(">Pendaftaran Dibuka</h2>");
    expect(html).not.toContain("Belum ada kompetisi untuk filter yang dipilih.");
  });
});

describe("halaman detail kompetisi", () => {
  const renderDetail = async (slug: string) =>
    renderToStaticMarkup(await CompetitionDetailPage({ params: Promise.resolve({ slug }) }));

  it("menampilkan header, ringkasan pendaftaran, dan kompetisi terkait", async () => {
    const competition = UVICS_COMPETITIONS.find((c) => c.status === "OPEN" && c.registrationUrl && c.guidebookUrl)!;
    const html = await renderDetail(competition.slug);
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain('aria-label="Ringkasan pendaftaran"');
    expect(html).toContain(`<a href="${competition.registrationUrl}" target="_blank" rel="noopener noreferrer"`);
    expect(html).toContain(`href="${competition.guidebookUrl}"`);
    expect(html).toContain(">Kompetisi terkait</h2>");
    expect(html).toContain(">Lihat semua kompetisi</a>");
  });

  it("slug tidak dikenal menjadi 404", async () => {
    await expect(renderDetail("tidak-ada")).rejects.toMatchObject({ digest: expect.stringContaining("404") });
  });

  it("header dan isi aman untuk field nullable", () => {
    const competition: Competition = {
      id: "x", slug: "x", title: "Judul X", organizer: "Penyelenggara X", description: "Deskripsi X",
      category: null, level: null, registrationDeadline: null, competitionDate: null,
      registrationUrl: null, guidebookUrl: null, poster: null, teamSize: null, eligibility: null,
      status: "OPEN", featured: false,
    };
    const html = [
      renderToStaticMarkup(createElement(CompetitionDetailHeader, { competition })),
      renderToStaticMarkup(createElement(CompetitionDetailContent, { competition })),
    ].join("");
    expect(html).not.toMatch(/undefined|>null<|Invalid Date/);
    expect(html).toContain("Belum ditentukan");
    expect(html).not.toContain("Daftar Sekarang");
    expect(html).not.toContain("Lihat Guidebook");
    expect(html).not.toContain("Syarat dan format");
  });

  it("tautan daftar hanya membuka tab baru saat pendaftaran dibuka", () => {
    const base: Competition = {
      id: "y", slug: "y", title: "Judul Y", organizer: "Penyelenggara Y", description: "Deskripsi Y",
      category: null, level: null, registrationDeadline: "2026-10-01", competitionDate: "2026-10-15",
      registrationUrl: "https://contoh.test/daftar", guidebookUrl: null, poster: null, teamSize: null, eligibility: null,
      status: "CLOSED", featured: false,
    };
    const closed = renderToStaticMarkup(createElement(CompetitionDetailContent, { competition: base }));
    expect(closed).toContain('href="https://contoh.test/daftar"');
    expect(closed).not.toContain('target="_blank"');
    const open = renderToStaticMarkup(createElement(CompetitionDetailContent, { competition: { ...base, status: "OPEN" } }));
    expect(open).toContain('<a href="https://contoh.test/daftar" target="_blank" rel="noopener noreferrer"');
  });

  it("menyorot batas pendaftaran selama masih bisa didaftar, lalu tanggal pelaksanaan", () => {
    const dates = (status: Competition["status"]) =>
      competitionDates({ ...UVICS_COMPETITIONS[0], status, registrationDeadline: "2026-10-01", competitionDate: "2026-11-01" });
    for (const status of ["OPEN", "UPCOMING"] as const) {
      expect(dates(status).primary).toEqual({ label: "Batas pendaftaran", date: "2026-10-01" });
    }
    for (const status of ["ONGOING", "CLOSED", "FINISHED"] as const) {
      expect(dates(status).primary).toEqual({ label: "Pelaksanaan", date: "2026-11-01" });
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
