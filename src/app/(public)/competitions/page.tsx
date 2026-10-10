import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Users, Clock, Globe, Award, ArrowRight } from "lucide-react";
import { UVICS_COMPETITIONS } from "@/src/data/mock/competitions";
import { Button } from "@/src/components/atoms/Button/Button";

export const metadata: Metadata = {
  title: "Kompetisi & Kejuaraan Teknologi | UVICS UNKLAB",
  description:
    "Kurasi kompetisi teknologi bergengsi tingkat nasional dan internasional untuk mahasiswa Universitas Klabat dengan bimbingan mentor UVICS.",
};

export default function CompetitionsListingPage() {
  return (
    <div className="min-h-screen py-16 md:py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header Halaman */}
      <div className="max-w-3xl mb-16 space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
          Kompetisi & <span className="text-primary">Kejuaraan Teknologi</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          Eksplorasi peluang prestasi di panggung nasional dan global. UVICS
          mendukung mahasiswa FIK UNKLAB dengan pembentukan tim, fasilitas
          persiapan, dan bimbingan mentor berpengalaman.
        </p>
      </div>

      {/* Grid Turnamen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {UVICS_COMPETITIONS.map((comp) => {
          const isOpen = comp.status === "OPEN";

          return (
            <div
              key={comp.id}
              className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Poster Image Container */}
                <div className="relative w-full h-52 overflow-hidden bg-gray-100">
                  <Image
                    src={comp.poster}
                    alt={comp.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent" />

                  {/* Top Badges pada Listing Page */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-md text-gray-900 shadow-xs flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-primary" />
                      <span>{comp.level}</span>
                    </span>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md shadow-xs ${
                        isOpen
                          ? "bg-emerald-500 text-white"
                          : comp.status === "UPCOMING"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-gray-200"
                      }`}
                    >
                      {isOpen ? "PENDAFTARAN BUKA" : comp.status}
                    </span>
                  </div>

                  {/* Bottom Image Overlay: Prize Pool & Countdown */}
                  {comp.prizePool && (
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                      <span className="flex items-center gap-1.5 font-semibold text-secondary">
                        <Award className="w-4 h-4" />
                        <span>Prize: {comp.prizePool}</span>
                      </span>
                      {comp.daysRemaining !== undefined &&
                        comp.daysRemaining > 0 && (
                          <span className="text-[11px] font-mono bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                            {comp.daysRemaining} hari lagi
                          </span>
                        )}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block mb-1">
                      {comp.organizer}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 font-heading">
                      <Link href={`/competitions/${comp.slug}`}>
                        {comp.title}
                      </Link>
                    </h2>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>

                  {/* Metadata Chips */}
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        Tenggat Daftar:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {comp.registrationDeadline}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600 pt-1.5 border-t border-gray-200/60">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        Format Tim:
                      </span>
                      <span className="font-medium text-gray-800">
                        {comp.teamSize}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0">
                <Button
                  variant="primary"
                  size="sm"
                  href={`/competitions/${comp.slug}`}
                  className="w-full text-xs"
                >
                  <span>Detail Lomba & Ketentuan</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
