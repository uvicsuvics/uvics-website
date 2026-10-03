import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Trophy,
  Users,
  Clock,
  Globe,
  Award,
  ExternalLink,
  FileText,
  ArrowLeft,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { UVICS_COMPETITIONS } from "@/data/mock/competitions";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return UVICS_COMPETITIONS.map((comp) => ({
    slug: comp.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comp = UVICS_COMPETITIONS.find((c) => c.slug === slug);

  if (!comp) {
    return {
      title: "Kompetisi Tidak Ditemukan | UVICS UNKLAB",
      description: "Informasi kompetisi yang Anda cari tidak tersedia di UVICS.",
    };
  }

  return {
    title: `${comp.title} | Kompetisi UVICS UNKLAB`,
    description: comp.description,
  };
}

export default async function CompetitionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const comp = UVICS_COMPETITIONS.find((c) => c.slug === slug);

  if (!comp) {
    notFound();
  }

  const isOpen = comp.status === "OPEN";

  return (
    <div className="min-h-screen py-12 md:py-20 px-6 md:px-8 max-w-6xl mx-auto w-full">
      {/* Tombol Kembali */}
      <div className="mb-8">
        <Link
          href="/competitions"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Kompetisi</span>
        </Link>
      </div>

      {/* Grid Konten Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Kolom Kiri: Poster Resolusi Penuh & Status Visual (5 Kolom) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative w-full aspect-3/4 rounded-3xl overflow-hidden border border-gray-200 shadow-md bg-gray-100">
            <Image
              src={comp.poster}
              alt={`Poster resmi kompetisi ${comp.title}`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>

          {/* Kartu Status Pendaftaran Cepat */}
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status Registrasi
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isOpen
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : comp.status === "UPCOMING"
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "bg-gray-200 text-gray-700 border border-gray-300"
                }`}
              >
                {comp.status === "OPEN"
                  ? "Pendaftaran Dibuka"
                  : comp.status === "UPCOMING"
                  ? "Segera Hadir"
                  : "Pendaftaran Ditutup"}
              </span>
            </div>

            {comp.daysRemaining !== undefined && comp.daysRemaining > 0 && (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Sisa waktu pendaftaran: <strong>{comp.daysRemaining} hari lagi</strong>
                </span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              {comp.registrationUrl && (
                <Button
                  variant="primary"
                  size="lg"
                  href={comp.registrationUrl}
                  className="w-full text-sm font-semibold"
                >
                  <span>Daftar Sekarang (Portal Resmi)</span>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              )}

              {comp.guidebookUrl && (
                <Button
                  variant="outline"
                  size="md"
                  href={comp.guidebookUrl}
                  className="w-full text-xs font-semibold"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  <span>Unduh Panduan (Guidebook)</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Deskripsi Lengkap & Metadata Kompetisi (7 Kolom) */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-primary-50 text-primary">
                <Globe className="w-3.5 h-3.5" />
                <span>Tingkat {comp.level}</span>
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                {comp.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 font-heading leading-tight">
              {comp.title}
            </h1>

            <p className="mt-2 text-sm font-medium text-gray-500">
              Diselenggarakan oleh: <strong className="text-gray-900">{comp.organizer}</strong>
            </p>
          </div>

          {/* Highlight Cards: Hadiah & Tenggat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {comp.prizePool && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Total Hadiah / Benefit</span>
                </div>
                <p className="text-lg font-bold text-gray-900 font-heading">
                  {comp.prizePool}
                </p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-primary-50/50 border border-primary-100 space-y-1">
              <div className="flex items-center gap-2 text-primary text-xs font-semibold">
                <Calendar className="w-4 h-4" />
                <span>Batas Akhir Registrasi</span>
              </div>
              <p className="text-base font-bold text-gray-900">
                {comp.registrationDeadline}
              </p>
            </div>
          </div>

          {/* Deskripsi Lengkap */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 font-heading">
              Tentang Kompetisi
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {comp.description}
            </p>
          </div>

          {/* Persyaratan & Format Tim */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 font-heading">
              Format Tim & Kelayakan Peserta
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">
                    Ukuran Tim
                  </h3>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {comp.teamSize}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">
                    Kriteria Peserta
                  </h3>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {comp.eligibility}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bimbingan & Mentoring UVICS Callout */}
          <div className="p-6 rounded-2xl bg-linear-to-r from-primary-50 to-blue-50 border border-primary-100 space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Trophy className="w-4 h-4" />
              <span>Dukungan Tim Delegasi UVICS</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              Tertarik mengikuti kompetisi ini dan membutuhkan rekan satu tim atau bimbingan dari mentor berpengalaman UVICS? Hubungi koordinator Competitive Programming atau kunjungi ruang komunitas kami di FIK UNKLAB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
