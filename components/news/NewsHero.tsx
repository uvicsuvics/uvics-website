import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/**
 * Header halaman berita (Konsep A): breadcrumb, judul, dan form cari GET ke /news.
 * @param search - Kata kunci aktif, diisi ulang ke kolom cari
 */
export function NewsHero({ search }: { search?: string }) {
  return (
    <section className="bg-primary-50 border-b border-primary-100">
      <div className="flex flex-col gap-8 mx-auto px-6 pt-28 pb-10 w-full max-w-7xl md:px-8 md:pt-32 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 min-w-0 max-w-2xl">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
            <ol className="flex flex-wrap items-center gap-x-2">
              <li>
                <Link href="/" className="text-gray-600 transition-colors hover:text-primary">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-400">/</li>
              <li aria-current="page" className="font-semibold text-primary">Berita</li>
            </ol>
          </nav>
          <h1 className="font-heading text-4xl font-bold leading-tight text-primary-900 md:text-5xl">Berita UVICS</h1>
          <p className="text-base leading-relaxed text-gray-700">
            Pengumuman, kabar kegiatan, dan artikel dari pengurus UVICS, diurutkan dari yang terbaru.
          </p>
        </div>

        <form action="/news" role="search" className="flex flex-col gap-1.5 w-full lg:max-w-sm">
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
            <Button type="submit" variant="primary" size="md" aria-label="Cari" className="shrink-0">
              <Search className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
