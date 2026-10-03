"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Code2,
  BrainCircuit,
  Palette,
  Trophy,
  ShieldCheck,
  Megaphone,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { DepartmentItem, UVICS_DEPARTMENTS } from "@/data/mock/departments";
import { Button } from "@/components/ui/Button";

export interface DepartmentsSectionProps {
  departments?: DepartmentItem[];
}

const DEPT_ICONS: Record<
  DepartmentItem["iconName"],
  React.ComponentType<{ className?: string }>
> = {
  Code2,
  BrainCircuit,
  Palette,
  Trophy,
  ShieldCheck,
  Megaphone,
};

/**
 * Seksi 4: Departments Preview (Homepage)
 * Mengimplementasikan Konsep 2: Minimalist Architectural Grid.
 * Menampilkan ringkasan 6 divisi/departemen UVICS dengan layout simetris 3 kolom,
 * penomoran indeks arsitektural (01 - 06), dan nuansa akademis prestisius.
 */
export function DepartmentsSection({
  departments = UVICS_DEPARTMENTS,
}: DepartmentsSectionProps) {
  // Empty state handling
  if (!departments || departments.length === 0) {
    return (
      <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
          <p className="text-sm font-medium text-gray-500">
            Belum ada data departemen yang tersedia saat ini.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header Seksi Terpusat & Rapi */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading"
        >
          Fokus Keahlian yang Terarah
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="text-base sm:text-lg text-gray-600 leading-relaxed"
        >
          UVICS memfasilitasi minat riset dan pengembangan mahasiswa melalui enam
          departemen dengan bimbingan mentor dan portofolio nyata.
        </motion.p>
      </div>

      {/* Grid 3 Kolom Simetris */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {departments.map((dept, index) => {
          const IconComp = DEPT_ICONS[dept.iconName] || Code2;
          const indexNumber = String(index + 1).padStart(2, "0");

          return (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group relative"
            >
              {/* Garis Aksen Atas saat Hover */}
              <div className="absolute top-0 left-8 right-8 h-1 bg-transparent group-hover:bg-primary transition-colors duration-300 rounded-b-md" />

              <div>
                {/* Header Card: Indeks & Ikon */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <span className="text-xs font-mono font-bold tracking-wider text-gray-400 group-hover:text-primary transition-colors">
                    {indexNumber} / 06
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary group-hover:border-primary-100 transition-colors duration-300">
                    <IconComp className="w-5 h-5" />
                  </div>
                </div>

                {/* Judul & Deskripsi */}
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-3">
                  {dept.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {dept.shortDescription}
                </p>

                {/* Koordinator & Keanggotaan */}
                <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1 mb-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-primary" />
                      Koordinator
                    </span>
                    <span className="font-semibold text-gray-800">
                      {dept.coordinator}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200/50">
                    <span>Kapasitas Talenta</span>
                    <span className="font-medium text-primary">
                      {dept.memberCount} Mahasiswa Aktif
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-4 border-t border-gray-100">
                <Link
                  href={`/departments/${dept.slug}`}
                  className="inline-flex items-center justify-between w-full text-sm font-bold text-gray-900 group-hover:text-primary transition-colors"
                >
                  <span>Lihat Detail Departemen</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bagian Bawah: Aksi Global */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="mt-16 p-8 rounded-3xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left"
      >
        <div>
          <h4 className="text-base font-bold text-gray-900">
            Ingin memahami silabus dan program kerja lengkap setiap divisi?
          </h4>
          <p className="text-sm text-gray-600">
            Pelajari struktur kurikulum internal dan panduan orientasi anggota baru.
          </p>
        </div>
        <Button variant="primary" size="md" href="/departments">
          <span>Kunjungi Halaman Departemen</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </section>
  );
}
