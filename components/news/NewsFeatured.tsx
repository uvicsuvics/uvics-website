import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format/date";
import type { NewsArticle } from "@/types/news";

/**
 * Berita sorotan (Konsep B, editorial split): foto besar di kiri, kategori, tanggal, judul,
 * ringkasan, dan penulis di kanan.
 * @param article - Berita terbaru
 */
export function NewsFeatured({ article }: { article: NewsArticle }) {
  const { slug, title, excerpt, thumbnail, category, author, publishedAt } = article;

  return (
    <article className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
      {thumbnail && (
        <div className="relative w-full overflow-hidden aspect-[4/3] rounded-2xl lg:shrink-0 lg:w-1/2">
          <Image src={thumbnail} alt={title} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>
      )}
      <div className="flex flex-col gap-4 min-w-0">
        <p className="text-xs font-bold tracking-[0.16em] uppercase text-primary">
          {[category, formatDate(publishedAt, "long")].filter(Boolean).join(" · ")}
        </p>
        <h2 className="font-heading text-3xl font-bold leading-tight text-primary-900 text-balance sm:text-4xl">
          <Link href={`/news/${slug}`} className="transition-colors hover:text-primary">
            {title}
          </Link>
        </h2>
        <p className="text-lg leading-relaxed text-gray-700">{excerpt}</p>
        {author && <p className="text-sm text-gray-600">{`Oleh ${author}`}</p>}
        <Button href={`/news/${slug}`} variant="primary" size="md" aria-label={`Baca berita ${title}`} className="self-start">
          Baca berita
          <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}
