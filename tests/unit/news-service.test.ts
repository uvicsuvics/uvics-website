import { describe, expect, it } from "vitest";
import { UVICS_NEWS } from "@/data/mock/news";
import { getNews, getNewsBySlug, getRelatedNews } from "@/lib/services/newsService";

describe("newsService", () => {
  it("mengembalikan DTO NewsArticle dan meta pagination, terbaru dulu", async () => {
    const { items, pagination } = await getNews({ page_size: 100 });
    expect(Object.keys(items[0]).sort()).toEqual([
      "author",
      "category",
      "content",
      "excerpt",
      "id",
      "publishedAt",
      "slug",
      "thumbnail",
      "title",
    ]);
    expect(pagination.total_items).toBe(UVICS_NEWS.length);
    const dates = items.map((a) => a.publishedAt);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("mencari judul dan isi tanpa membedakan huruf (PRD §41)", async () => {
    const byTitle = await getNews({ search: "DEVHUB", page_size: 100 });
    expect(byTitle.items.map((a) => a.slug)).toContain("contoh-catatan-kelas-devhub");
    const contentOnly = UVICS_NEWS.find((n) => n.content.includes("halaman Join UVICS"))!;
    expect(contentOnly.title).not.toMatch(/join/i);
    const byContent = await getNews({ search: "halaman join", page_size: 100 });
    expect(byContent.items.map((a) => a.slug)).toEqual([contentOnly.slug]);
  });

  it("halaman 1 tanpa hasil tetap valid, halaman di luar total 404", async () => {
    await expect(getNews({ search: "tidakadayangcocok" })).resolves.toMatchObject({
      items: [],
      pagination: { total_items: 0 },
    });
    await expect(getNews({ page: 2, page_size: 100 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("setiap slug yang ditaut beranda resolve, slug tak dikenal null", async () => {
    for (const { slug } of UVICS_NEWS) expect((await getNewsBySlug(slug))?.slug).toBe(slug);
    expect(await getNewsBySlug("tidak-ada")).toBeNull();
  });

  it("berita terkait: kategori sama dulu, tanpa dirinya sendiri, maksimal 3", async () => {
    const current = UVICS_NEWS[0];
    const related = await getRelatedNews(current.slug);
    expect(related).toHaveLength(3);
    expect(related.map((a) => a.slug)).not.toContain(current.slug);
    expect(related[0].category).toBe(current.category);
    expect(await getRelatedNews("tidak-ada")).toEqual([]);
  });
});
