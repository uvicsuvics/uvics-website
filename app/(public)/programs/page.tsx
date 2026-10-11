import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Trophy,
  Laptop,
  Rocket,
  Compass,
  Users,
  Clock,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { UVICS_PROGRAMS } from '@/data/mock/programs';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Program Kerja & Aktivitas Unggulan | UVICS UNKLAB',
  description:
    'Siklus pembinaan talenta Informatika UVICS: dari workshop fondasi, kolaborasi produk, mentoring kompetisi, hingga panggung prestasi.',
};

const PROG_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy,
  Laptop,
  Rocket,
  Compass,
  Users,
  Presentation: Trophy,
};

// Map authentic UVICS photos for program showcase
const PROGRAM_PHOTOS: Record<string, string> = {
  'competition-mentoring': '/images/img/foto-1.webp',
  'internal-workshops': '/images/img/foto-3.webp',
  'project-collaboration': '/images/img/foto-4.webp',
  'achievement-showcase': '/images/img/foto-14.webp',
  'competition-updates': '/images/img/foto-10.webp',
  'community-sharing': '/images/img/foto-13.webp',
};

export default function ProgramsListingPage() {
  const flagshipPrograms = UVICS_PROGRAMS.slice(0, 2);
  const ecosystemPrograms = UVICS_PROGRAMS.slice(2);

  return (
    <div className="py-16 md:py-24 px-6 md:px-8 max-w-7xl mx-auto w-full space-y-16">
      {/* Header Halaman */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-bold text-primary tracking-wider uppercase bg-primary-50 px-3 py-1 rounded-full">
          Program Kerja & Pembinaan UVICS
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
          Aktivitas Nyata Menuju <span className="text-primary">Prestasi Teknologi</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          Dari penguasaan fondasi pemrograman hingga panggung kejuaraan nasional, setiap inisiatif UVICS dirancang
          berkesinambungan untuk membentuk talenta unggul di Fakultas Ilmu Komputer Universitas Klabat.
        </p>
      </div>

      {/* Program Bento Showcase */}
      <div className="space-y-8">
        {/* 1. Top Tier Bento: 2 Program Flagship Unggulan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {flagshipPrograms.map((prog) => {
            const photoSrc = PROGRAM_PHOTOS[prog.slug] || '/images/img/foto-1.webp';

            return (
              <div
                key={prog.id}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group space-y-6"
              >
                <div className="space-y-5">
                  {/* Photo Banner with Category Tag */}
                  <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-xs border border-gray-100">
                    <Image
                      src={photoSrc}
                      alt={prog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-primary text-white shadow-xs">
                        {prog.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-secondary text-gray-900 shadow-xs">
                        Program Unggulan
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 font-heading group-hover:text-primary transition-colors">
                      <Link href={`/programs/${prog.slug}`}>{prog.title}</Link>
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {prog.description}
                    </p>
                  </div>

                  {/* Metadata Box */}
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">
                        Frekuensi Pelaksanaan
                      </span>
                      <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        {prog.frequency}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">
                        Sasaran Peserta
                      </span>
                      <span className="font-semibold text-gray-800 flex items-center gap-1.5 truncate">
                        <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                        {prog.targetAudience}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Key Output & CTA */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-primary uppercase block">
                      Target Luaran
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {prog.keyOutput}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    href={`/programs/${prog.slug}`}
                    className="text-xs"
                  >
                    <span>Detail Silabus</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Second Tier Bento: 4 Program Penunjang & Ekosistem (Grid 4 Kolom) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ecosystemPrograms.map((prog) => {
            const IconComp = PROG_ICON_MAP[prog.iconName] || Trophy;

            return (
              <div
                key={prog.id}
                className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {prog.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 font-heading group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/programs/${prog.slug}`}>{prog.title}</Link>
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-3 mt-1.5 leading-relaxed">
                      {prog.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-800 block">
                      Luaran: {prog.keyOutput}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Ritme: {prog.frequency}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    href={`/programs/${prog.slug}`}
                    className="w-full text-xs justify-between group-hover:text-primary"
                  >
                    <span>Pelajari Program</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
