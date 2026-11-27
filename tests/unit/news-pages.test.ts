import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import NewsPage from "@/app/(public)/news/(list)/page";
import NewsDetailPage from "@/app/(public)/news/[slug]/page";
import { NewsRow } from "@/components/news/NewsList";
import { UVICS_NEWS } from "@/data/mock/news";
import { getNews, getNewsBySlug } from "@/lib/services/newsService";
import { paginate } from "@/lib/services/query";
import type { NewsArticle } from "@/types/news";

vi.mock("@/lib/services/newsService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/services/newsService")>();
  return { ...actual, getNews: vi.fn(actual.getNews), getNewsBySlug: vi.fn(actual.getNewsBySlug) };
});

const strip = (html: string) => html.replaceAll("<!-- -->", "");
const renderList = async (params: Record<string, string> = {}) =>
  strip(renderToStaticMarkup(await NewsPage({ searchParams: Promise.resolve(params) })));
const renderDetail = async (slug: string) =>
  strip(renderToStaticMarkup(await NewsDetailPage({ params: Promise.resolve({ slug }) })));
// Grid daftar dimulai dari judul section "Semua berita".
const gridOf = (html: string) => html.slice(html.indexOf('id="semua-berita-heading"'));

const fixture: NewsArticle = {
  id: "x",
  slug: "x",
  title: "Judul X",
  excerpt: "Ringkasan X",
  content: "Paragraf satu.",
  thumbnail: null,
  category: null,
  author: null,
  publishedAt: "2026-10-24",
};

describe("halaman /news (Konsep A)", () => {
  it("hero berpita berisi judul, form cari dengan tombol ikon, dan jumlah berita", async () => {
    const html = await renderList();
    expect(html).toMatch(/<h1[^>]*>Berita UVICS<\/h1>/);
    expect(html).toMatch(/<button[^>]*aria-label="Cari"/);
    expect(gridOf(html)).toContain(`>${UVICS_NEWS.length} berita<`);
  });

  it("sorotan berlabel Berita terbaru dan baris berisi ubin tanggal, kategori, serta thumbnail", async () => {
    const html = await renderList();
    const [latest] = UVICS_NEWS;
    expect(html.slice(0, html.indexOf('id="semua-berita-heading"'))).toContain("Berita terbaru");
    expect(html).toMatch(new RegExp(`href="/news/${latest.slug}"[^>]*>Baca berita`));
    const grid = gridOf(html);
    expect(grid).toMatch(/<time[^>]*datetime="2026-10-24"[^>]*>.*?>24<.*?Okt 2026/i);
    expect(grid).toContain(">Kegiatan<");
    expect(grid.match(/<img/g)?.length).toBeGreaterThan(0);
  });

  it("menyorot berita terbaru di halaman 1 tanpa mengulangnya di grid", async () => {
    const html = await renderList();
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    const [latest, ...rest] = UVICS_NEWS;
    const grid = gridOf(html);
    expect(html.indexOf(`href="/news/${latest.slug}"`)).toBeLessThan(html.indexOf('id="semua-berita-heading"'));
    expect(grid).not.toContain(`href="/news/${latest.slug}"`);
    for (const { slug } of rest) expect(grid).toContain(`href="/news/${slug}"`);
  });

  it("pencarian memakai form GET, mengisi ulang kata kunci, dan tanpa sorotan", async () => {
    const html = await renderList({ search: "devhub" });
    expect(html).toMatch(/<form[^>]*action="\/news"/);
    expect(html).toContain('name="search"');
    expect(html).toContain('value="devhub"');
    expect(html).not.toContain(`href="/news/${UVICS_NEWS[0].slug}"`);
    expect(gridOf(html)).toContain('href="/news/contoh-catatan-kelas-devhub"');
  });

  it("empty state tanpa pencarian dan dengan pencarian beserta tombol reset", async () => {
    vi.mocked(getNews).mockResolvedValueOnce(paginate([], 1, 9));
    const empty = await renderList();
    expect(empty).toContain("Belum ada berita yang dipublikasikan.");
    expect(empty).not.toContain("Reset pencarian");

    const noMatch = await renderList({ search: "tidakadayangcocok" });
    expect(noMatch).toContain("Belum ada berita untuk pencarian ini.");
    expect(noMatch).toMatch(/href="\/news"[^>]*>Reset pencarian/);
  });

  it("tautan pagination mempertahankan pencarian", async () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ ...fixture, id: `n${i}`, slug: `n${i}` }));
    vi.mocked(getNews).mockResolvedValueOnce(paginate(many, 1, 9));
    const html = await renderList({ search: "ai" });
    expect(html).toContain('href="/news?search=ai&amp;page=2#semua-berita"');
  });

  it("parameter rusak jatuh ke halaman 1, halaman di luar total menjadi 404", async () => {
    await expect(renderList({ page: "abc" })).resolves.toContain('id="semua-berita-heading"');
    await expect(renderList({ page: "99" })).rejects.toMatchObject({ digest: expect.stringContaining("404") });
  });
});

describe("halaman /news/[slug] (Konsep A)", () => {
  it("menampilkan kategori, judul, tanggal dan penulis, isi per paragraf, dan berita lainnya", async () => {
    const article = UVICS_NEWS[1];
    const html = await renderDetail(article.slug);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain(article.title);
    expect(html).toContain("24 Oktober 2026");
    expect(html).toContain("Pengurus UVICS");
    expect(html).toContain(article.category);
    expect(html.match(/<p[^>]*>Contoh paragraf/g)).toHaveLength(2);
    expect(html).toMatch(/<time[^>]*datetime="2026-10-24"[^>]*>24 Oktober 2026<\/time>/i);
    expect(html).not.toContain("Info publikasi");
    const related = html.slice(html.indexOf('id="berita-lainnya-heading"'));
    expect(related).toMatch(/href="\/news"[^>]*>Semua berita/);
    expect(related.match(/href="\/news\/[^"]+"/g)).toHaveLength(3);
    // Baris berita lainnya ringkas: tanpa ringkasan.
    expect(related).not.toContain("Contoh ringkasan");
  });

  it("slug tidak dikenal menjadi 404", async () => {
    await expect(renderDetail("tidak-ada")).rejects.toMatchObject({ digest: expect.stringContaining("404") });
  });

  it("isi artikel dirender sebagai teks, bukan HTML", async () => {
    vi.mocked(getNewsBySlug).mockResolvedValueOnce({ ...fixture, content: "<script>alert(1)</script>\n\nParagraf dua" });
    const html = await renderDetail("x");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert");
  });

  it("detail dan baris aman untuk field nullable", async () => {
    vi.mocked(getNewsBySlug).mockResolvedValueOnce(fixture);
    const detail = await renderDetail("x");
    const row = renderToStaticMarkup(createElement(NewsRow, { article: fixture }));
    for (const html of [detail, row]) expect(html).not.toMatch(/undefined|>null<|Invalid Date/);
    expect(row).not.toContain("<img");
    expect(detail.slice(0, detail.indexOf('id="berita-lainnya-heading"'))).not.toContain("<img");
    expect(detail).not.toContain(">Penulis<");
    expect(detail).not.toContain(">Kategori<");
    expect(detail).toContain("24 Oktober 2026");
  });
});
