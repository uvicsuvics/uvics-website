"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Users,
  GraduationCap,
  Trophy,
  Code2,
  Swords,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { GlanceStatItem, UVICS_GLANCE_STATS } from "@/data/mock/stats";

interface GlanceSectionProps {
  stats?: GlanceStatItem[];
}

const CATEGORY_ICONS: Record<
  GlanceStatItem["category"],
  React.ComponentType<{ className?: string }>
> = {
  members: Users,
  alumni: GraduationCap,
  achievements: Trophy,
  projects: Code2,
  competitions: Swords,
  events: CalendarDays,
};

/**
 * Section 3: UVICS at a Glance
 * Mengimplementasikan Konsep 3: Prestigious Split Editorial Showcase
 * Berisi 6 metrik utama (Active Members, Alumni, Achievements, Projects, Competitions, Events)
 * dengan layout editorial berwibawa khas institusi pendidikan dan teknologi.
 */
export function GlanceSection({ stats = UVICS_GLANCE_STATS }: GlanceSectionProps) {
  // Penanganan Empty State bila data belum tersedia
  if (!stats || stats.length === 0) {
    return (
      <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="p-8 text-center bg-gray-50 rounded-3xl border border-gray-200">
          <p className="text-sm font-medium text-gray-500">
            Data statistik pencapaian UVICS sedang diperbarui.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Kolom Kiri: Naratif & Penjelasan Dampak (5 Kolom) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="lg:col-span-5 space-y-6 lg:sticky lg:top-28"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.15]">
            Membangun Talenta, <br />
            <span className="text-primary">Mencetak Prestasi</span> di Universitas Klabat
          </h2>

          <p className="text-base text-gray-600 leading-relaxed">
            UVICS bukan sekadar wadah berkumpul, melainkan inkubator mahasiswa berprestasi yang menghubungkan logika pemrograman, etika kebajikan, dan daya saing global.
          </p>

          {/* Kotak Nilai Utama */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex items-center gap-2.5 text-primary font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Inisiatif Mahasiswa Terintegrasi</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Setiap capaian dihasilkan melalui kolaborasi lintas fakultas, program mentoring intensif, dan dedikasi berkelanjutan dari seluruh anggota.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-600 transition-colors group"
            >
              <span>Pelajari Visi & Perjalanan Kami</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        {/* Kolom Kanan: Matriks Metrik Arsitektural (7 Kolom) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="lg:col-span-7 rounded-3xl border border-gray-200 bg-white shadow-xs overflow-hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            {/* Kolom Kiri Matriks (3 items) */}
            <div className="divide-y divide-gray-200">
              {stats.slice(0, 3).map((item) => {
                const IconComponent = CATEGORY_ICONS[item.category] || Users;
                return (
                  <div
                    key={item.id}
                    className="p-8 hover:bg-gray-50/70 transition-colors duration-200 flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700">
                        {item.badgeText || "Statistik"}
                      </span>
                      <IconComponent className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>

                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight font-heading">
                        {item.value}
                      </span>
                      <span className="text-3xl sm:text-4xl font-extrabold text-primary">
                        {item.suffix}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      {item.label}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">
                      {item.description}
                    </p>

                    {item.trendText && (
                      <span className="text-[11px] font-medium text-primary">
                        • {item.trendText}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Kolom Kanan Matriks (3 items) */}
            <div className="divide-y divide-gray-200 border-t sm:border-t-0 border-gray-200">
              {stats.slice(3, 6).map((item) => {
                const IconComponent = CATEGORY_ICONS[item.category] || Trophy;
                return (
                  <div
                    key={item.id}
                    className="p-8 hover:bg-gray-50/70 transition-colors duration-200 flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700">
                        {item.badgeText || "Statistik"}
                      </span>
                      <IconComponent className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>

                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight font-heading">
                        {item.value}
                      </span>
                      <span className="text-3xl sm:text-4xl font-extrabold text-primary">
                        {item.suffix}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      {item.label}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">
                      {item.description}
                    </p>

                    {item.trendText && (
                      <span className="text-[11px] font-medium text-primary">
                        • {item.trendText}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
