import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DepartmentSection } from "@/components/departments/DepartmentSection";
import { NewsGrid } from "@/components/news/NewsCard";
import { TextHero } from "@/components/sections/TextHero";
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

  const related = await getRelatedNews(slug);
  const facts = [
    { label: "Diterbitkan", value: formatDate(article.publishedAt, "long") },
    ...(article.author ? [{ label: "Penulis", value: article.author }] : []),
    ...(article.category ? [{ label: "Kategori", value: article.category }] : []),
  ];

  return (
    <div className="flex flex-col pb-24">
      <TextHero
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Berita", href: "/news" }, { label: article.title }]}
        eyebrow={article.category ? `Berita · ${article.category}` : "Berita"}
        title={article.title}
        titleClassName="text-4xl sm:text-5xl lg:text-6xl"
        description={article.excerpt}
        media={
          article.thumbnail ? (
            <div className="relative w-full overflow-hidden aspect-[4/3] rounded-2xl lg:shrink-0 lg:w-[34rem]">
              <Image
                src={article.thumbnail}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 544px"
                className="object-cover"
              />
            </div>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-10 mx-auto px-6 pt-16 w-full max-w-7xl md:px-8 lg:flex-row lg:gap-16">
        <aside aria-label="Info publikasi" className="lg:shrink-0 lg:w-64">
          <dl className="border-t-2 border-primary-900">
            {facts.map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5 py-4 border-b border-gray-200">
                <dt className="text-xs text-gray-600">{label}</dt>
                <dd className="font-semibold text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>
        {/* Teks polos sampai renderer Tiptap ada; React meng-escape isi sehingga HTML tidak pernah dirender. */}
        <div className="flex flex-col gap-5 min-w-0 max-w-3xl text-lg leading-relaxed text-gray-800">
          {toParagraphs(article.content).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      {related.length > 0 && (
        <DepartmentSection id="berita-lainnya" heading={{ title: "Berita", titleHighlight: "lainnya" }}>
          <NewsGrid articles={related} />
        </DepartmentSection>
      )}
    </div>
  );
}
