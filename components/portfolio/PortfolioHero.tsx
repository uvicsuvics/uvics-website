import { cn } from '@/lib/utils';

interface PortfolioHeroProps {
  /** Satu-satunya h1 pada halaman. */
  title: string;
  description: string;
  className?: string;
}

/**
 * Hero halaman daftar portfolio (prestasi, project). Latarnya terang karena navbar publik
 * `fixed` dan transparan di mobile, sehingga logo dan menu tidak terbaca di atas latar gelap.
 */
export function PortfolioHero({ title, description, className }: PortfolioHeroProps) {
  return (
    <section
      className={cn('relative overflow-hidden bg-primary-50/60 border-b border-gray-200/90', className)}
      aria-labelledby="portfolio-hero-heading"
    >
      <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-secondary/20 blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col gap-4 mx-auto px-4 pt-28 pb-16 w-full max-w-7xl sm:px-6 sm:pt-32 sm:pb-20 lg:px-8 lg:pt-36 lg:pb-24">
        <span className="w-12 h-1 rounded-full bg-secondary" aria-hidden="true" />
        <h1
          id="portfolio-hero-heading"
          className="max-w-3xl font-heading text-3xl font-bold leading-tight text-gray-900 text-balance sm:text-5xl"
        >
          {title}
        </h1>
        <p className="max-w-2xl leading-relaxed text-gray-600 sm:text-lg">{description}</p>
      </div>
    </section>
  );
}
