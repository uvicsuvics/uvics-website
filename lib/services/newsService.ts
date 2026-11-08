import { cache } from "react";
import { UVICS_NEWS, type NewsItem } from "@/data/mock/news";
import { normalizeSearch } from "@/lib/backend/content";
import { DEFAULT_PAGE_SIZE, paginate, type Paginated } from "@/lib/services/query";
import { findBySlug } from "@/lib/services/shared";
import type { NewsArticle, NewsQuery } from "@/types/news";

// Sumber data sementara: mock. Saat tabel `posts` ada, isi fungsi diganti query Supabase
// (frontend-convention §11); signature tetap sehingga halaman tidak berubah.

// shortcut: memetakan bentuk mock lama yang masih dipakai NewsSection beranda; hapus saat #51
// memindahkan section ke service dan mock berbentuk DTO.
function toArticle(item: NewsItem): NewsArticle {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    content: item.content,
    thumbnail: item.image || null,
    category: item.category || null,
    author: item.author.name || null,
    publishedAt: item.isoDate,
  };
}

/** Terbaru dulu (published_at desc); tanggal YYYY-MM-DD bisa dibandingkan sebagai string. */
const listNews = (): NewsArticle[] =>
  UVICS_NEWS.map(toArticle).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

function matchesSearch(article: NewsArticle, term: string | undefined): boolean {
  const search = term ? normalizeSearch(term).toLowerCase() : "";
  return (
    !search ||
    article.title.toLowerCase().includes(search) ||
    article.content.toLowerCase().includes(search)
  );
}

/**
 * Daftar berita dengan pencarian judul dan isi (PRD §41) dan pagination kontrak backend.
 * @throws AppError NOT_FOUND bila `page` melewati total halaman.
 */
export async function getNews(query: NewsQuery = {}): Promise<Paginated<NewsArticle>> {
  const items = listNews().filter((article) => matchesSearch(article, query.search));
  return paginate(items, query.page ?? 1, query.page_size ?? DEFAULT_PAGE_SIZE);
}

/** Dibungkus `cache` supaya `generateMetadata` dan page berbagi satu hasil per request. */
export const getNewsBySlug = cache(
  async (slug: string): Promise<NewsArticle | null> => findBySlug(listNews(), slug),
);

/** Berita lain: kategori sama dulu, lalu terbaru; tanpa dirinya sendiri. */
export async function getRelatedNews(slug: string, limit = 3): Promise<NewsArticle[]> {
  const news = listNews();
  const current = findBySlug(news, slug);
  if (!current) return [];
  const others = news.filter((article) => article.id !== current.id);
  const sameCategory = (a: NewsArticle) => current.category !== null && a.category === current.category;
  return [...others.filter(sameCategory), ...others.filter((a) => !sameCategory(a))].slice(0, limit);
}
