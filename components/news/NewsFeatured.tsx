import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format/date";
import type { NewsArticle } from "@/types/news";

/**
 * Berita sorotan (Konsep A): foto lebar di kiri; kategori, tanggal, penulis, judul, ringkasan,
 * dan tautan baca di kanan.
 * @param article - Berita terbaru
 */
export function NewsFeatured({ article }: { article: NewsArticle }) {
  const { slug, title, excerpt, thumbnail, category, author, publishedAt } = article;

  return (
    <article className="flex flex-col gap-8 lg:flex-row lg:items-center">
      {thumbnail && (
        <div className="relative w-full overflow-hidden aspect-video rounded-xl lg:shrink-0 lg:w-7/12">
          <Image src={thumbnail} alt={title} fill priority sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />
        </div>
      )}
      <div className="flex flex-col gap-3 min-w-0">
        <p className="text-xs font-bold tracking-[0.16em] uppercase text-primary">Berita terbaru</p>
        <p className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          {category && <Badge className="font-semibold">{category}</Badge>}
          {[formatDate(publishedAt, "long"), author].filter(Boolean).join(" · ")}
        </p>
        <h2 className="font-heading text-3xl font-bold leading-tight text-primary-900 text-balance md:text-4xl">
          <Link href={`/news/${slug}`} className="transition-colors hover:text-primary">
            {title}
          </Link>
        </h2>
        <p className="leading-relaxed text-gray-700">{excerpt}</p>
        <Link
          href={`/news/${slug}`}
          aria-label={`Baca berita ${title}`}
          className="inline-flex items-center gap-1.5 self-start font-semibold text-primary transition-colors hover:text-primary-700"
        >
          Baca berita
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
