import type { Metadata } from "next";
import { Newspaper, SearchX } from "lucide-react";
import { DepartmentSection } from "@/components/departments/DepartmentSection";
import { NewsGrid } from "@/components/news/NewsCard";
import { NewsFeatured } from "@/components/news/NewsFeatured";
import { TextHero } from "@/components/sections/TextHero";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { getNews } from "@/lib/services/newsService";
import { orNotFound, readPage, readSearch, type SearchParams } from "@/lib/services/query";
import { listHref } from "@/lib/utils";

const description = "Pengumuman, kabar kegiatan, dan artikel dari pengurus UVICS.";

export const metadata: Metadata = { title: "Berita | UVICS", description };

/** Berita per halaman, termasuk berita sorotan di halaman 1. */
const NEWS_PAGE_SIZE = 9;
const LIST_ID = "semua-berita";

interface NewsPageProps {
  searchParams: Promise<SearchParams>;
}

// loading.tsx ada di route group (list) supaya tidak membungkus /news/[slug]: slug tak dikenal tetap HTTP 404.
export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const search = readSearch(params);
  const { items, pagination } = await orNotFound(
    getNews({ page: readPage(params), search, page_size: NEWS_PAGE_SIZE }),
  );
  // Sorotan hanya di halaman 1 tanpa pencarian, dan tidak diulang di grid.
  const featured = !search && pagination.page === 1 ? items[0] : undefined;
  const grid = featured ? items.slice(1) : items;

  return (
    <div className="flex flex-col pb-24">
      <TextHero
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Berita" }]}
        eyebrow="Kabar UVICS"
        title="Berita"
        titleHighlight="terbaru"
        description={description}
      >
        <form action="/news" role="search" className="flex flex-col gap-1.5 w-full max-w-xl">
          <label htmlFor="cari-berita" className="text-sm font-semibold text-gray-700">
            Cari berita
          </label>
          <div className="flex gap-2">
            <Input
              id="cari-berita"
              type="search"
              name="search"
              defaultValue={search}
              maxLength={100}
              placeholder="Judul atau isi berita"
            />
            <Button type="submit" variant="primary" size="md">
              Cari
            </Button>
          </div>
        </form>
      </TextHero>

      {featured && (
        <section aria-label="Berita terbaru" className="mx-auto px-6 pt-16 w-full max-w-7xl sm:pt-20 md:px-8">
          <NewsFeatured article={featured} />
        </section>
      )}

      {(grid.length > 0 || !featured) && (
        <DepartmentSection
          id={LIST_ID}
          heading={search ? { title: "Hasil", titleHighlight: "pencarian" } : { title: "Semua", titleHighlight: "berita" }}
          note={search ? `${pagination.total_items} berita` : undefined}
        >
          {grid.length > 0 ? (
            <NewsGrid articles={grid} />
          ) : (
            <EmptyState
              className="mt-8"
              icon={search ? SearchX : Newspaper}
              message={search ? "Belum ada berita untuk pencarian ini." : "Belum ada berita yang dipublikasikan."}
              action={
                search ? (
                  <Button variant="outline" size="md" href="/news">
                    Reset pencarian
                  </Button>
                ) : undefined
              }
            />
          )}
          <Pagination
            className="pt-10"
            label="Navigasi halaman berita"
            currentPage={pagination.page}
            totalPages={pagination.total_pages}
            getHref={(page) => `${listHref("/news", { search, page })}#${LIST_ID}`}
          />
        </DepartmentSection>
      )}
    </div>
  );
}
