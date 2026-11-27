import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, UserRound } from "lucide-react";
import { NewsList, NewsListSection } from "@/components/news/NewsList";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format/date";
import { getNewsBySlug, getRelatedNews } from "@/lib/services/newsService";
import { toParagraphs } from "@/lib/utils";

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const article = await getNewsBySlug((await params).slug);
  if (!article) {
    return { title: "Berita Tidak Ditemukan | UVICS" };
  }
  return { title: `${article.title} | Berita UVICS`, description: article.excerpt };
}

// Tanpa loading.tsx di segmen ini: notFound() harus terjadi sebelum streaming agar status HTTP 404.
export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) {
    notFound();
  }

  const { title, category, author, thumbnail, publishedAt, content } = article;
  const related = await getRelatedNews(slug);

  return (
    <div className="flex flex-col pb-24">
      <div className="bg-primary-50 border-b border-primary-100">
        {/* pt-28 menjaga breadcrumb tetap di bawah navbar publik yang fixed. */}
        <nav aria-label="Breadcrumb" className="mx-auto px-6 pt-28 pb-5 w-full max-w-7xl text-sm text-gray-600 md:px-8 md:pt-32">
          <ol className="flex flex-wrap items-center gap-x-2">
            <li>
              <Link href="/" className="text-gray-600 transition-colors hover:text-primary">
                Beranda
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-400">/</li>
            <li>
              <Link href="/news" className="text-gray-600 transition-colors hover:text-primary">
                Berita
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-400">/</li>
            <li aria-current="page" className="font-semibold text-primary">{title}</li>
          </ol>
        </nav>
      </div>

      <article className="flex flex-col items-center gap-8 mx-auto px-6 pt-14 w-full max-w-7xl md:px-8">
        <header className="flex flex-col gap-4 w-full max-w-3xl">
          {category && <Badge className="self-start font-semibold">{category}</Badge>}
          <h1 className="font-heading text-4xl font-bold leading-tight text-primary-900 text-balance md:text-5xl">
            {title}
          </h1>
          <p className="flex flex-wrap gap-x-5 gap-y-1 pb-5 text-sm text-gray-600 border-b border-gray-200">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 shrink-0" aria-hidden="true" />
              <time dateTime={publishedAt}>{formatDate(publishedAt, "long")}</time>
            </span>
            {author && (
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="w-4 h-4 shrink-0" aria-hidden="true" />
                {author}
              </span>
            )}
          </p>
        </header>

        {thumbnail && (
          <div className="relative w-full max-w-5xl overflow-hidden aspect-video rounded-xl">
            <Image src={thumbnail} alt={title} fill priority sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
          </div>
        )}

        {/* Teks polos sampai renderer Tiptap ada; React meng-escape isi sehingga HTML tidak pernah dirender. */}
        <div className="flex flex-col gap-5 w-full max-w-3xl text-lg leading-relaxed text-gray-800">
          {toParagraphs(content).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      {related.length > 0 && (
        <NewsListSection
          id="berita-lainnya"
          title="Berita lainnya"
          aside={
            <Link href="/news" className="text-sm font-semibold text-primary transition-colors hover:text-primary-700">
              Semua berita
            </Link>
          }
          className="mx-auto px-6 pt-18 w-full max-w-7xl md:px-8"
        >
          <NewsList articles={related} compact />
        </NewsListSection>
      )}
    </div>
  );
}
