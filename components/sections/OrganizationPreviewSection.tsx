import { ArrowRight } from "lucide-react";
import { MemberCard } from "@/components/organization/MemberCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import type { PublicMember } from "@/lib/backend/dto";

interface OrganizationPreviewSectionProps {
  /** Nama periode ACTIVE, mis. "2025/2026". */
  periodName?: string;
  /** Pengurus inti periode aktif: Ketua, Bendahara, Sekretaris (PRD §13). */
  coreTeam: PublicMember[];
}

/**
 * Seksi 11: Current Organization Preview. Kartu pengurus memakai field D02 saja.
 */
export function OrganizationPreviewSection({ periodName, coreTeam }: OrganizationPreviewSectionProps) {
  return (
    <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <Reveal className="max-w-2xl space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
            Pengurus Inti <span className="text-primary">Periode Aktif</span>
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Ketua, Bendahara, dan Sekretaris UVICS{periodName ? ` periode ${periodName}` : ""}.
          </p>
        </Reveal>
        <Reveal className="shrink-0">
          <Button variant="outline" size="md" href="/organization">
            <span>Struktur Organisasi Lengkap</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Reveal>
      </div>

      <Reveal>
        {coreTeam.length === 0 ? (
          <EmptyState message="Data pengurus periode aktif belum tersedia." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coreTeam.map((member) => (
              <li key={`${member.name}-${member.position}`}>
                <MemberCard member={member} />
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </section>
  );
}
