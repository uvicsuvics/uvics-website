import { Fragment } from "react";
import Link from "next/link";

interface DepartmentsHeroProps {
  /** Elemen terakhir adalah halaman ini (tanpa href, aria-current="page"). */
  breadcrumbs: { label: string; href?: string }[];
  eyebrow: string;
  title: string;
  /** Kata penutup judul yang diberi warna biru. */
  titleHighlight?: string;
  description: string;
  /** Ringkasan angka yang sudah dihitung dari data; kosong bila tidak ada. */
  stats: { label: string; value: string }[];
}

/**
 * Hero teks halaman departemen (listing dan detail): breadcrumb, eyebrow, judul, deskripsi,
 * dan ringkasan angka. Berisi satu-satunya h1 halaman.
 */
export function DepartmentsHero({ breadcrumbs, eyebrow, title, titleHighlight, description, stats }: DepartmentsHeroProps) {
  return (
    <section aria-labelledby="departments-heading" className="border-b border-gray-200">
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

        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 min-w-0 max-w-2xl lg:max-w-xl">
            <p className="text-xs font-bold tracking-[0.16em] uppercase text-primary">{eyebrow}</p>
            <h1
              id="departments-heading"
              className="font-heading text-5xl font-bold leading-[1.05] text-primary-900 sm:text-6xl lg:text-7xl"
            >
              {title}
              {titleHighlight && <span className="text-primary"> {titleHighlight}</span>}
            </h1>
            <p className="text-lg leading-relaxed text-gray-700">{description}</p>
          </div>

          {stats.length > 0 && (
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
          )}
        </div>
      </div>
    </section>
  );
}
