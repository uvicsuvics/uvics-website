import React from "react";
import { Reveal } from "@/components/ui/Reveal";
import type { SectionHeading } from "@/data/mock/about";
import { cn } from "@/lib/utils";

interface ContentSectionProps {
  /** id section (bisa jadi anchor); h2 memakai `${id}-heading`. */
  id: string;
  heading: SectionHeading;
  /** Latar `bg-muted` untuk memisahkan section yang berdampingan. */
  muted?: boolean;
  children: React.ReactNode;
}

/**
 * Kerangka section halaman Tentang dan Visi & Misi: container standar, judul section, lalu isi.
 */
export function ContentSection({ id, heading, muted, children }: ContentSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section id={id} aria-labelledby={headingId} className={cn("scroll-mt-16 py-16 sm:py-24", muted && "bg-muted")}>
      <div className="flex flex-col gap-10 mx-auto px-6 w-full max-w-7xl md:px-8">
        <Reveal className="flex flex-col gap-3 max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">{heading.eyebrow}</p>
          <h2
            id={headingId}
            className="font-heading text-3xl font-bold leading-tight text-gray-900 text-balance sm:text-4xl"
          >
            {heading.title}
          </h2>
          {heading.description && <p className="leading-relaxed text-gray-600">{heading.description}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
