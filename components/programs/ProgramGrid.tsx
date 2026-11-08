import { ProgramCard } from "@/components/programs/ProgramCard";
import { Reveal } from "@/components/ui/Reveal";
import type { PublicProgram } from "@/lib/services/programService";

interface ProgramGridProps {
  programs: PublicProgram[];
  linkLabel: string;
}

/**
 * Grid kartu program di halaman detail (departemen dan program), 1/2/3 kolom.
 */
export function ProgramGrid({ programs, linkLabel }: ProgramGridProps) {
  return (
    <Reveal className="pt-10">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <li key={program.id}>
            <ProgramCard program={program} linkLabel={linkLabel} />
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
