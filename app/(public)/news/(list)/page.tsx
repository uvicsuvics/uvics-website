import type { Metadata } from "next";
import { Newspaper, SearchX } from "lucide-react";
import { NewsFeatured } from "@/components/news/NewsFeatured";
import { NewsHero } from "@/components/news/NewsHero";
import { NewsList, NewsListSection } from "@/components/news/NewsList";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { getNews } from "@/lib/services/newsService";
import { orNotFound, readPage, readSearch, type SearchParams } from "@/lib/services/query";
import { listHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Berita | UVICS",
  description: "Pengumuman, kabar kegiatan, dan artikel dari pengurus UVICS.",
};

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
  // Sorotan hanya di halaman 1 tanpa pencarian, dan tidak diulang di daftar.
  const featured = !search && pagination.page === 1 ? items[0] : undefined;
  const rows = featured ? items.slice(1) : items;

  return (
    <div className="flex flex-col">
      <NewsHero search={search} />

      <div className="flex flex-col gap-14 mx-auto px-6 pt-14 pb-24 w-full max-w-7xl md:px-8">
        {featured && <NewsFeatured article={featured} />}

        {(rows.length > 0 || !featured) && (
          <NewsListSection
            id={LIST_ID}
            title={search ? "Hasil pencarian" : "Semua berita"}
            aside={<span className="text-sm text-gray-500">{`${pagination.total_items} berita`}</span>}
          >
            {rows.length > 0 ? (
              <NewsList articles={rows} />
            ) : (
              <EmptyState
                className="mt-6"
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
          </NewsListSection>
        )}
      </div>
    </div>
  );
}
