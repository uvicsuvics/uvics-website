import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import DepartmentDetailPage from "@/app/(public)/departments/[slug]/page";
import { UVICS_DEPARTMENTS_PAGE } from "@/data/mock/departments";
import { getActivePeriod, getPeriodMembers } from "@/lib/services/organizationService";

vi.mock("@/lib/services/organizationService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/services/organizationService")>();
  return {
    ...actual,
    getActivePeriod: vi.fn(actual.getActivePeriod),
    getPeriodMembers: vi.fn(actual.getPeriodMembers),
  };
});

const render = async (slug: string) =>
  renderToStaticMarkup(await DepartmentDetailPage({ params: Promise.resolve({ slug }) })).replaceAll("<!-- -->", "");
// Isi satu section, dari h2 berid `${id}-heading` sampai penutup section.
const sectionOf = (html: string, id: string) => {
  const start = html.indexOf(`id="${id}-heading"`);
  expect(start).toBeGreaterThan(-1);
  return html.slice(start, html.indexOf("</section>", start));
};
const programLinks = (html: string) => [...html.matchAll(/href="\/programs\/([^"]+)"/g)].map((match) => match[1]);

describe("halaman /departments/[slug] (Konsep A)", () => {
  it("menampilkan hero dengan nomor resmi, breadcrumb, dan ringkasan periode aktif", async () => {
    const html = await render("web-development");

    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>Web Development<\/h1>/);
    expect(html).toMatch(/<a[^>]*href="\/departments"[^>]*>Departemen<\/a>/);
    expect(html).toContain(">Departemen 03<");
    expect(html).toMatch(/<dt[^>]*>Koordinator<\/dt><dd[^>]*>Bryan Wowor<\/dd>/);
    expect(html).toMatch(/<dt[^>]*>Pengurus<\/dt><dd[^>]*>4<\/dd>/);
    expect(html).toMatch(/<dt[^>]*>Periode aktif<\/dt><dd[^>]*>2025\/2026<\/dd>/);
  });

  it("hanya menaut program yang dikelola departemen itu", async () => {
    const programs = sectionOf(await render("web-development"), "program");
    expect(programLinks(programs).sort()).toEqual(["devhub", "website-building"]);
  });

  it("mengurutkan pengurus sesuai posisi resmi", async () => {
    const members = sectionOf(await render("web-development"), "pengurus");
    const order = ["Daniel Lumempouw", "Bryan Wowor", "Christian Pangemanan", "Jessica Runtu"].map((name) =>
      members.indexOf(`>${name}<`),
    );
    expect(order.every((at) => at > -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("menaut empat departemen lain dengan nomor resmi", async () => {
    const others = sectionOf(await render("web-development"), "departemen-lainnya");
    const slugs = [...others.matchAll(/href="\/departments\/([^"]+)"/g)].map((match) => match[1]);
    expect(slugs.sort()).toEqual(["competition-handler", "editor", "external-affairs", "public-relations"]);
    for (const number of ["01", "02", "04", "05"]) expect(others).toContain(`>${number}</span>`);
    expect(others).not.toContain(">03</span>");
  });

  it("menampilkan pesan kosong untuk departemen tanpa program", async () => {
    const programs = sectionOf(await render("external-affairs"), "program");
    expect(programs).toContain(UVICS_DEPARTMENTS_PAGE.detail.programs.emptyMessage);
    expect(programLinks(programs)).toEqual([]);
  });

  it("tanpa periode aktif menyembunyikan ringkasan pengurus dan menampilkan empty state", async () => {
    vi.mocked(getActivePeriod).mockResolvedValueOnce(null);
    const html = await render("web-development");
    expect(html).not.toMatch(/<dt[^>]*>Koordinator<\/dt>/);
    expect(sectionOf(html, "pengurus")).toContain(UVICS_DEPARTMENTS_PAGE.detail.membersEmptyMessage);
  });

  it("periode aktif tanpa pengurus departemen tidak menampilkan jumlah pengurus nol", async () => {
    vi.mocked(getPeriodMembers).mockResolvedValueOnce([]);
    const html = await render("web-development");
    expect(html).not.toMatch(/<dt[^>]*>Pengurus<\/dt>/);
    expect(html).toMatch(/<dt[^>]*>Periode aktif<\/dt><dd[^>]*>2025\/2026<\/dd>/);
    expect(sectionOf(html, "pengurus")).toContain(UVICS_DEPARTMENTS_PAGE.detail.membersEmptyMessage);
  });

  it("slug yang tidak ada berujung 404", async () => {
    await expect(DepartmentDetailPage({ params: Promise.resolve({ slug: "tidak-ada" }) })).rejects.toMatchObject({
      digest: "NEXT_HTTP_ERROR_FALLBACK;404",
    });
  });
});
