import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDayMonth, getYear } from "@/lib/format/date";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/types/news";

interface NewsRowProps {
  article: NewsArticle;
  /** Baris ringkas untuk "Berita lainnya": tanpa ringkasan, thumbnail lebih kecil. */
  compact?: boolean;
}

/**
 * Satu baris daftar berita (Konsep A): tanggal, kategori, judul, ringkasan, dan thumbnail.
 * Kategori dan thumbnail kosong disembunyikan.
 * @param article - Berita yang ditampilkan
 */
export function NewsRow({ article, compact = false }: NewsRowProps) {
  const { slug, title, excerpt, thumbnail, category, publishedAt } = article;
  const { day, month } = formatDayMonth(publishedAt);

  return (
    <li className="flex flex-wrap items-center gap-x-8 gap-y-4 py-6 border-b border-gray-200/90">
      <time dateTime={publishedAt} className="flex flex-col w-28 shrink-0 text-sm text-gray-600">
        <span className="font-heading text-3xl font-bold leading-none text-primary-900">{day}</span>
        {`${month} ${getYear(publishedAt)}`}
      </time>

      <div className="flex flex-col flex-1 gap-1.5 min-w-0 basis-80">
        {category && <Badge className="self-start font-semibold">{category}</Badge>}
        <h3 className="text-lg font-semibold leading-snug text-gray-900">
          <Link href={`/news/${slug}`} className="transition-colors hover:text-primary">
            {title}
          </Link>
        </h3>
        {!compact && <p className="text-[15px] leading-relaxed text-gray-600 line-clamp-2">{excerpt}</p>}
      </div>

      {thumbnail && (
        <div
          className={cn(
            "relative shrink-0 overflow-hidden aspect-[3/2] rounded-lg",
            compact ? "hidden w-40 sm:block" : "w-full sm:w-52",
          )}
        >
          <Image src={thumbnail} alt={title} fill sizes="(max-width: 640px) 100vw, 208px" className="object-cover" />
        </div>
      )}
    </li>
  );
}

/** Daftar baris berita. */
export function NewsList({ articles, compact }: { articles: NewsArticle[]; compact?: boolean }) {
  return (
    <ul>
      {articles.map((article) => (
        <NewsRow key={article.id} article={article} compact={compact} />
      ))}
    </ul>
  );
}

interface NewsListSectionProps {
  /** id section (anchor); h2 memakai `${id}-heading`. */
  id: string;
  title: string;
  /** Di kanan judul, mis. jumlah berita atau tautan "Semua berita". */
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Grup berita bergaya linimasa event (Konsep A): judul Playfair bergaris tebal lalu isi. */
export function NewsListSection({ id, title, aside, className, children }: NewsListSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={cn("flex flex-col scroll-mt-28", className)}>
      <div className="flex items-baseline justify-between gap-3 pb-2.5 border-b-2 border-gray-900">
        <h2 id={headingId} className="font-heading text-2xl font-bold text-gray-900">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
