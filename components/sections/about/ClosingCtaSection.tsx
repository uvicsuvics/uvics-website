import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { ClosingCtaContent } from "@/data/mock/about";

interface ClosingCtaSectionProps {
  cta: ClosingCtaContent;
}

/**
 * Ajakan penutup halaman Tentang dan Visi & Misi.
 * CTA sekunder berupa tautan teks karena varian outline Button tidak terbaca di atas `bg-primary`.
 */
export function ClosingCtaSection({ cta }: ClosingCtaSectionProps) {
  return (
    <section aria-labelledby="closing-cta-heading" className="py-16 sm:py-24">
      <div className="mx-auto px-6 w-full max-w-7xl md:px-8">
        <Reveal className="flex flex-col items-center gap-6 px-6 py-12 text-center text-white bg-primary rounded-2xl sm:px-12 sm:py-16">
          <h2
            id="closing-cta-heading"
            className="max-w-2xl font-heading text-3xl font-bold leading-tight text-balance sm:text-4xl"
          >
            {cta.title}
          </h2>
          <p className="max-w-2xl leading-relaxed text-primary-100">{cta.description}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Button href={cta.primaryCta.href} variant="secondary" size="lg">
              {cta.primaryCta.label}
            </Button>
            <Link
              href={cta.secondaryCta.href}
              className="inline-flex items-center gap-2 font-semibold text-white rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {cta.secondaryCta.label}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
