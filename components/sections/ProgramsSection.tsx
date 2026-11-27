import { ArrowRight } from "lucide-react";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import type { PublicProgram } from "@/lib/services/programService";

export interface ProgramsSectionProps {
  programs: PublicProgram[];
}

/**
 * Seksi 5: Programs / What We Do (Homepage). Kartu sama dengan halaman /programs.
 */
export function ProgramsSection({ programs }: ProgramsSectionProps) {
  return (
    <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <Reveal className="max-w-2xl space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
            Program Kerja & <span className="text-primary">Aktivitas Rutin</span>
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Dari pendampingan lomba dan belajar bersama hingga kampanye edukasi untuk masyarakat.
          </p>
        </Reveal>
        <Reveal className="shrink-0">
          <Button variant="outline" size="md" href="/programs">
            <span>Lihat Semua Program</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Reveal>
      </div>

      <Reveal>
        {programs.length === 0 ? (
          <EmptyState message="Daftar program kerja sedang disiapkan." />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <li key={program.id}>
                <ProgramCard program={program} linkLabel="Lihat program" />
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </section>
  );
}
