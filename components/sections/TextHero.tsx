import { Fragment } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TextHeroProps {
  /** Elemen terakhir adalah halaman ini (tanpa href, aria-current="page"). */
  breadcrumbs: { label: string; href?: string }[];
  eyebrow: string;
  title: string;
  /** Kata penutup judul yang diberi warna biru. */
  titleHighlight?: string;
  /** Kelas ukuran judul pengganti, mis. untuk judul berita yang panjang. */
  titleClassName?: string;
  description: string;
  /** Ringkasan angka yang sudah dihitung dari data; tidak dipakai bila ada `media`. */
  stats?: { label: string; value: string }[];
  /** Kolom kanan, mis. foto program; menggantikan ringkasan angka. */
  media?: React.ReactNode;
  /** Isi tambahan di bawah deskripsi, mis. tautan departemen pengelola. */
  children?: React.ReactNode;
}

/**
 * Hero teks halaman publik (departemen, program): breadcrumb, eyebrow, judul, deskripsi, lalu
 * ringkasan angka atau media di kanan. Berisi satu-satunya h1 halaman.
 */
export function TextHero({
  breadcrumbs,
  eyebrow,
  title,
  titleHighlight,
  titleClassName,
  description,
  stats = [],
  media,
  children,
}: TextHeroProps) {
  return (
    <section aria-labelledby="text-hero-heading" className="border-b border-gray-200">
      {/* pt-28 menjaga teks tetap di bawah navbar publik yang fixed. */}
      <div className="flex flex-col gap-10 mx-auto px-6 pt-28 pb-14 w-full max-w-7xl md:px-8 md:pt-36 md:pb-16">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
          <ol className="flex flex-wrap items-center gap-x-2">
            {breadcrumbs.map(({ label, href }, index) => (
              <Fragment key={`${index}-${label}`}>
                {index > 0 && (
                  <li aria-hidden="true" className="text-gray-400">
                    /
                  </li>
                )}
                {href ? (
                  <li>
                    <Link href={href} className="text-gray-600 transition-colors hover:text-primary">
                      {label}
                    </Link>
                  </li>
                ) : (
                  <li aria-current="page" className="font-semibold text-primary">
                    {label}
                  </li>
                )}
              </Fragment>
            ))}
          </ol>
        </nav>

        <div
          className={cn(
            "flex flex-col gap-10 lg:flex-row lg:justify-between",
            media ? "lg:items-center" : "lg:items-end",
          )}
        >
          <div className={cn("flex flex-col gap-5 min-w-0", media ? "lg:flex-1" : "max-w-2xl lg:max-w-xl")}>
            <p className="text-xs font-bold tracking-[0.16em] uppercase text-primary">{eyebrow}</p>
            <h1
              id="text-hero-heading"
              className={cn(
                "font-heading text-5xl font-bold leading-[1.05] text-primary-900 sm:text-6xl lg:text-7xl",
                titleClassName,
              )}
            >
              {title}
              {titleHighlight && <span className="text-primary"> {titleHighlight}</span>}
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-gray-700">{description}</p>
            {children}
          </div>

          {media ??
            (stats.length > 0 && (
              <dl className="flex flex-col shrink-0 rounded-2xl border border-gray-200 divide-y divide-gray-200 sm:flex-row sm:divide-y-0 sm:divide-x">
                {stats.map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-4 px-5 py-3 sm:flex-col sm:items-start sm:justify-start sm:gap-1 sm:px-7 sm:py-5"
                  >
                    <dt className="text-xs text-gray-600">{label}</dt>
                    <dd className="font-(family-name:--font-heading) text-2xl font-bold text-right text-primary-900 sm:text-3xl sm:text-left">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            ))}
        </div>
      </div>
    </section>
  );
}
