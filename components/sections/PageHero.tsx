import Image from "next/image";
import { Button } from "@/components/ui/Button";
import type { PageHeroContent } from "@/data/mock/about";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  hero: PageHeroContent;
}

/**
 * Hero halaman informasi publik dengan satu-satunya h1 halaman.
 * Latar terang dan offset `pt-28` karena navbar publik `fixed` dan transparan (pola hero #42).
 * @param hero - Eyebrow, judul, deskripsi, CTA, dan foto (opsional)
 */
export function PageHero({ hero }: PageHeroProps) {
  const { eyebrow, title, description, primaryCta, secondaryCta, image } = hero;

  return (
    <section aria-labelledby="page-hero-heading" className="bg-primary-50/60 border-b border-gray-200">
      <div
        className={cn(
          "grid items-center gap-10 mx-auto px-6 pt-28 pb-16 w-full max-w-7xl md:px-8 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24",
          image && "lg:grid-cols-2",
        )}
      >
        <div className="flex flex-col gap-5">
          <p className="flex items-center gap-3 text-sm font-semibold tracking-wide text-primary uppercase">
            <span className="w-8 h-1 rounded-full bg-secondary" aria-hidden="true" />
            {eyebrow}
          </p>
          <h1
            id="page-hero-heading"
            className="max-w-3xl font-heading text-3xl font-bold leading-tight text-gray-900 text-balance sm:text-5xl"
          >
            {title}
          </h1>
          <p className="max-w-2xl leading-relaxed text-gray-600 sm:text-lg">{description}</p>
          {(primaryCta || secondaryCta) && (
            <div className="flex flex-wrap gap-3 pt-2">
              {primaryCta && (
                <Button href={primaryCta.href} size="lg">
                  {primaryCta.label}
                </Button>
              )}
              {secondaryCta && (
                <Button href={secondaryCta.href} variant="outline" size="lg">
                  {secondaryCta.label}
                </Button>
              )}
            </div>
          )}
        </div>
        {image && (
          <div className="relative w-full overflow-hidden aspect-4/3 rounded-2xl shadow-md">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
