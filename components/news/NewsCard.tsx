import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { formatDate } from "@/lib/format/date";
import type { NewsArticle } from "@/types/news";

/**
 * Kartu berita (Konsep B): thumbnail, kategori, tanggal, judul, dan ringkasan.
 * Thumbnail kosong diganti panel ikon; kategori kosong disembunyikan.
 * @param article - Berita yang ditampilkan
 */
export function NewsCard({ article }: { article: NewsArticle }) {
  const { slug, title, excerpt, thumbnail, category, publishedAt } = article;

  return (
    <article className="flex flex-col h-full overflow-hidden bg-white rounded-xl border border-gray-200">
      <div className="relative aspect-video bg-primary-50">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-primary-300">
            <Newspaper className="w-10 h-10" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 gap-2.5 p-6">
        <p className="text-sm text-gray-600">
          {category && <span className="font-semibold text-primary">{`${category} · `}</span>}
          {formatDate(publishedAt)}
        </p>
        <h3 className="font-heading text-xl font-bold leading-snug text-gray-900">
          <Link href={`/news/${slug}`} className="transition-colors hover:text-primary">
            {title}
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">{excerpt}</p>
      </div>
    </article>
  );
}

/** Grid kartu berita tiga kolom di desktop. */
export function NewsGrid({ articles }: { articles: NewsArticle[] }) {
  return (
    <ul className="grid gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <li key={article.id}>
          <NewsCard article={article} />
        </li>
      ))}
    </ul>
  );
}
