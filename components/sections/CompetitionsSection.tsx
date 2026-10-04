"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Users,
  ArrowRight,
  ExternalLink,
  Award,
  Clock,
} from "lucide-react";
import { CompetitionItem, UVICS_COMPETITIONS } from "@/data/mock/competitions";
import { Button } from "@/components/ui/Button";

export interface CompetitionsSectionProps {
  competitions?: CompetitionItem[];
}

/**
 * Seksi 6: Featured Competitions (Homepage)
 * Mengimplementasikan Konsep 1: Modern Tournament Card Grid with Countdown & Status Badges.
 * Menampilkan poster turnamen visual dengan indikator status (OPEN/CLOSED), level kejuaraan,
 * penghitung mundur sisa hari pendaftaran, serta rincian prize pool.
 */
export function CompetitionsSection({
  competitions = UVICS_COMPETITIONS,
}: CompetitionsSectionProps) {
  // Empty state handling
  if (!competitions || competitions.length === 0) {
    return (
      <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
          <p className="text-sm font-medium text-gray-500">
            Belum ada kompetisi yang tersedia saat ini.
          </p>
        </div>
      </section>
    );
  }

  // Tampilkan 3 kompetisi terdepan untuk pratinjau Beranda
  const displayCompetitions = competitions.slice(0, 3);

  return (
    <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header Seksi */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="max-w-2xl space-y-3">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading"
          >
            Kompetisi <span className="text-primary">Pilihan</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="text-base text-gray-600 leading-relaxed"
          >
            Kurasi kejuaraan teknologi tingkat nasional dan internasional yang siap
            diikuti oleh mahasiswa Universitas Klabat dengan dukungan mentoring UVICS.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="shrink-0"
        >
          <Button variant="outline" size="md" href="/competitions">
            <span>Jelajahi Semua Lomba</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>

      {/* Grid 3 Kartu Turnamen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayCompetitions.map((comp, index) => {
          return (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Poster Image Container dengan Overlay Status */}
                <div className="relative w-full h-52 overflow-hidden bg-gray-100">
                  <Image
                    src={comp.poster}
                    alt={comp.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent" />

                  {/* Bottom Image Overlay: Prize Pool & Countdown */}
                  {comp.prizePool && (
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                      <span className="flex items-center gap-1.5 font-semibold text-secondary">
                        <Award className="w-4 h-4" />
                        <span>Prize: {comp.prizePool}</span>
                      </span>
                      {comp.daysRemaining && comp.daysRemaining > 0 && (
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
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 font-heading">
                      {comp.title}
                    </h3>
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
              <div className="p-6 pt-0 flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  href={`/competitions/${comp.slug}`}
                  className="flex-1 text-xs"
                >
                  <span>Detail Lomba</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>

                {comp.registrationUrl && (
                  <Link
                    href={comp.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Daftar ${comp.title} (buka tab baru)`}
                    className="p-2.5 rounded-lg border border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
