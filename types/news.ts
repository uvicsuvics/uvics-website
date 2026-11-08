/** Kolom berita PRD §15 yang dipakai UI; publishedAt YYYY-MM-DD (tanggal WITA dari `published_at`). */
export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Teks polos, paragraf dipisah baris kosong; renderer Tiptap menyusul bersama CMS berita. */
  content: string;
  /** URL atau path siap next/image. */
  thumbnail: string | null;
  category: string | null;
  author: string | null;
  publishedAt: string;
}

export interface NewsQuery {
  page?: number;
  page_size?: number;
  search?: string;
}
