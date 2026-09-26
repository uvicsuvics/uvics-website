"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Trophy,
  Award,
  Medal,
  Users,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { AchievementItem, UVICS_ACHIEVEMENTS } from "@/data/mock/achievements";
import { Button } from "@/components/ui/Button";

interface AchievementsSectionProps {
  achievements?: AchievementItem[];
}

/**
 * Seksi 9: Latest Achievements (Chronological Milestone Ledger)
 * Menampilkan catatan prestasi mahasiswa Informatika UVICS dalam format linimasa kehormatan
 * dengan filter tahun interaktif, alur linimasa presisi, dan kartu milestone horizontal.
 */
export function AchievementsSection({
  achievements = UVICS_ACHIEVEMENTS,
}: AchievementsSectionProps) {
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const years = ["all", "2026", "2025", "2024"];

  const filteredItems =
    selectedYear === "all"
      ? achievements
      : achievements.filter((item) => item.year === selectedYear);

  const getRankBadge = (tier: "gold" | "silver" | "bronze", rankText: string) => {
    switch (tier) {
      case "gold":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>{rankText}</span>
          </span>
        );
      case "silver":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <Medal className="w-3.5 h-3.5 text-slate-500" />
            <span>{rankText}</span>
          </span>
        );
      case "bronze":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300">
            <Award className="w-3.5 h-3.5 text-orange-600" />
            <span>{rankText}</span>
          </span>
        );
    }
  };

  return (
    <section className="py-24 px-6 md:px-8 max-w-6xl mx-auto w-full">
      {/* Header Seksi */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary-50 text-primary text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Linimasa Kebanggaan Organisasi</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
            Catatan Jejak <span className="text-primary">Prestasi Ilmiah</span>
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Arsip kronologis torehan medali dan penghargaan mahasiswa Informatika UVICS
            dalam berbagai ajang kompetisi teknologi bergengsi tanah air.
          </p>
        </div>

        {/* Filter Tahun */}
        <div className="flex items-center gap-1.5 p-1.5 bg-gray-100 rounded-xl border border-gray-200 self-start md:self-auto">
          {years.map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                selectedYear === yr
                  ? "bg-white text-primary shadow-xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {yr === "all" ? "Semua Tahun" : `Tahun ${yr}`}
            </button>
          ))}
        </div>
      </div>

      {/* Linimasa Vertikal */}
      <div className="relative pl-6 md:pl-10 border-l-2 border-primary/20 space-y-8">
        {filteredItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: idx * 0.08 }}
            className="relative group"
          >
            {/* Titik Node Indikator Linimasa */}
            <div
              className={`absolute -left-[31px] md:-left-[47px] top-4 w-5 h-5 rounded-full border-4 border-white shadow-xs transition-colors duration-300 ${
                item.rankTier === "gold"
                  ? "bg-secondary"
                  : item.rankTier === "silver"
                  ? "bg-slate-400"
                  : "bg-primary"
              }`}
            />

            {/* Kartu Milestone */}
            <div className="rounded-2xl bg-white border border-gray-200 p-6 md:p-8 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Info Utama Prestasi (8 Kolom) */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {getRankBadge(item.rankTier, item.ranking)}
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.date}</span>
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      Tingkat {item.level}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors font-heading">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-primary mt-1">
                      {item.competitionName} • {item.organizer}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Info Delegasi & Aksi */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-800">
                        {item.teamName}:
                      </span>
                      <span className="text-xs text-gray-600">
                        {item.teamMembers.join(", ")}
                      </span>
                    </div>

                    <Link
                      href={`/achievements/${item.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-700 group-hover:translate-x-1 transition-all"
                    >
                      <span>Lihat Rincian Arsip</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Thumbnail Dokumentasi Visual (4 Kolom) */}
                <div className="lg:col-span-4 relative h-48 sm:h-52 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 30vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white text-[11px] font-semibold flex items-center justify-between">
                    <span className="truncate">{item.teamName}</span>
                    <span className="font-mono text-secondary">
                      {item.year}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Bawah */}
      <div className="mt-14 text-center">
        <Button variant="outline" size="md" href="/achievements">
          <span>Jelajahi Arsip Kejuaraan Lengkap</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </section>
  );
}
