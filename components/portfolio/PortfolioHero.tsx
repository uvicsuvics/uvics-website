import { cn } from '@/lib/utils';

interface PortfolioHeroProps {
  /** Satu-satunya h1 pada halaman. */
  title: string;
  description: string;
  className?: string;
}

/** Hero halaman daftar portfolio (prestasi, project) memakai token warna brand. */
export function PortfolioHero({ title, description, className }: PortfolioHeroProps) {
  return (
    <section
      className={cn('relative overflow-hidden text-white bg-primary-900', className)}
      aria-labelledby="portfolio-hero-heading"
    >
      <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-accent/25 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col gap-4 mx-auto px-4 py-16 w-full max-w-7xl sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <span className="w-12 h-1 rounded-full bg-secondary" aria-hidden="true" />
        <h1
          id="portfolio-hero-heading"
          className="max-w-3xl font-heading text-3xl font-bold leading-tight text-balance sm:text-5xl"
        >
          {title}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-primary-50 sm:text-lg">{description}</p>
      </div>
    </section>
  );
}
