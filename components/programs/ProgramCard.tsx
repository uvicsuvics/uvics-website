import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicProgram } from "@/lib/services/programService";

interface ProgramCardProps {
  program: PublicProgram;
  linkLabel: string;
}

/**
 * Kartu program: foto, nama, deskripsi singkat, dan tautan ke /programs/{slug}.
 */
export function ProgramCard({ program, linkLabel }: ProgramCardProps) {
  return (
    <article className="flex flex-col h-full overflow-hidden bg-white rounded-xl border border-gray-200">
      <div className="relative aspect-video">
        <Image
          src={program.image}
          alt={program.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col flex-1 gap-3 p-6">
        <h3 className="font-heading text-xl font-bold text-gray-900">{program.title}</h3>
        <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">{program.description}</p>
        <Link
          href={`/programs/${program.slug}`}
          className="group inline-flex items-center gap-1.5 self-start mt-auto pt-2 font-semibold text-primary rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {linkLabel}
          <span className="sr-only"> {program.title}</span>
          <ArrowRight
            className="w-4 h-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
