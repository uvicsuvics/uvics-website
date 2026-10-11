import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Trophy,
  Laptop,
  Rocket,
  Presentation,
  Compass,
  Users,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { UVICS_PROGRAMS, ProgramItem } from "@/data/mock/programs";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const PROGRAM_ICONS: Record<
  ProgramItem["iconName"],
  React.ComponentType<{ className?: string }>
> = {
  Trophy,
  Laptop,
  Rocket,
  Presentation,
  Compass,
  Users,
};

export async function generateStaticParams() {
  return UVICS_PROGRAMS.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = UVICS_PROGRAMS.find((p) => p.slug === slug);

  if (!program) {
    return {
      title: "Program Tidak Ditemukan | UVICS UNKLAB",
      description: "Informasi program kerja yang dicari tidak tersedia.",
    };
  }

  return {
    title: `${program.title} | Program Kerja UVICS UNKLAB`,
    description: program.description,
  };
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const program = UVICS_PROGRAMS.find((p) => p.slug === slug);

  if (!program) {
    notFound();
  }

  const IconComp = PROGRAM_ICONS[program.iconName] || Trophy;

  return (
    <div className="min-h-screen py-12 md:py-20 px-6 md:px-8 max-w-5xl mx-auto w-full">
      {/* Tombol Kembali */}
      <div className="mb-8">
        <Link
          href="/programs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Program</span>
        </Link>
      </div>

      {/* Header Program */}
      <div className="p-8 sm:p-12 rounded-3xl bg-linear-to-b from-gray-50 to-white border border-gray-200 space-y-6 mb-12 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary text-white flex items-center justify-center shadow-primary shrink-0">
            <IconComp className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                Fase {program.stepNumber} • {program.category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 font-heading">
              {program.title}
            </h1>
          </div>
        </div>

        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          {program.description}
        </p>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
          <div className="p-4 rounded-xl bg-white border border-gray-100 space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Frekuensi Kegiatan
            </span>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span>{program.frequency}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-gray-100 space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Sasaran Peserta
            </span>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Users className="w-4 h-4 text-primary shrink-0" />
              <span>{program.targetAudience}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Capaian & Panduan Partisipasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="p-8 rounded-3xl bg-emerald-50/40 border border-emerald-200 space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-base font-heading">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Output & Tolok Ukur Keberhasilan</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed font-medium">
            {program.keyOutput}
          </p>
          <p className="text-xs text-gray-600">
            Setiap peserta yang menuntaskan program ini memperoleh rekam jejak portofolio terverifikasi dan sertifikasi kegiatan dari UVICS FIK UNKLAB.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-primary-50/40 border border-primary-200 space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold text-base font-heading">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Cara Berpartisipasi</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Program ini terbuka untuk seluruh anggota aktif UVICS. Pendaftaran dan jadwal sesi rutin diumumkan berkala melalui Discord dan grup koordinasi resmi.
          </p>
          <Button variant="primary" size="md" href="/join" className="w-full text-xs">
            <span>Gabung UVICS Sekarang</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
