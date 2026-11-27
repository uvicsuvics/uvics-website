import React from "react";
import type { SectionHeading } from "@/data/mock/about";

interface DepartmentSectionProps {
  /** id section (bisa jadi anchor); h2 memakai `${id}-heading`. */
  id: string;
  heading: SectionHeading;
  /** Keterangan kecil di kanan judul, mis. periode aktif. */
  note?: string;
  children: React.ReactNode;
}

/**
 * Kerangka section halaman departemen (Konsep A): judul Playfair dengan garis tebal di bawahnya, lalu isi.
 */
export function DepartmentSection({ id, heading, note, children }: DepartmentSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-16 pt-16 sm:pt-20">
      <div className="mx-auto px-6 w-full max-w-7xl md:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-5 border-b-2 border-primary-900">
          <h2
            id={headingId}
            className="font-heading text-2xl font-bold leading-tight text-primary-900 text-balance sm:text-3xl"
          >
            {heading.title} <span className="text-primary">{heading.titleHighlight}</span>
          </h2>
          {note && <p className="text-sm text-gray-600">{note}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
