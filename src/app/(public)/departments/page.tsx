import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Code2,
  BrainCircuit,
  Palette,
  Trophy,
  ShieldCheck,
  Megaphone,
  ArrowRight,
} from "lucide-react";
import { UVICS_DEPARTMENTS, DepartmentItem } from "@/src/data/mock/departments";
import { Button } from "@/src/components/atoms/Button/Button";

export const metadata: Metadata = {
  title: "Struktur Departemen & Divisi Riset | UVICS UNKLAB",
  description:
    "Eksplorasi 6 pilar departemen spesialisasi di UVICS FIK UNKLAB dengan kurikulum terarah, mentoring intensif, dan portofolio nyata.",
};

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

export default function DepartmentsListingPage() {
  return (
    <div className="min-h-screen py-16 md:py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header Halaman */}
      <div className="max-w-3xl mb-16 space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
          Struktur Departemen &{" "}
          <span className="text-primary">Divisi Riset</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          UVICS memfasilitasi minat dan potensi teknologi mahasiswa melalui enam
          divisi keahlian. Setiap divisi memiliki silabus pembelajaran berkala,
          program kerja mandiri, dan dukungan mentoring untuk lomba tingkat
          nasional.
        </p>
      </div>

      {/* Grid 6 Departemen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {UVICS_DEPARTMENTS.map((dept, index) => {
          const IconComp = DEPT_ICONS[dept.iconName] || Code2;
          const indexNum = String(index + 1).padStart(2, "0");

          return (
            <div
              key={dept.id}
              className="p-8 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-6">
                {/* Header Kartu: Ikon & Indeks */}
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-900 group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                    <IconComp className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-mono font-bold tracking-wider text-gray-400 group-hover:text-primary transition-colors">
                    DIV-{indexNum}
                  </span>
                </div>

                {/* Konten Utama */}
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors font-heading">
                    <Link href={`/departments/${dept.slug}`}>{dept.name}</Link>
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {dept.shortDescription}
                  </p>
                </div>

                {/* Tag Fokus Keahlian */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {dept.focusAreas.slice(0, 3).map((area, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium"
                    >
                      {area}
                    </span>
                  ))}
                  {dept.focusAreas.length > 3 && (
                    <span className="px-2 py-1 rounded-md bg-gray-50 text-gray-500 text-[11px]">
                      +{dept.focusAreas.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Footer Kartu & Aksi */}
              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500 space-y-0.5">
                  <span className="block font-medium text-gray-800">
                    {dept.coordinator}
                  </span>
                  <span className="block text-[11px] text-gray-400">
                    {dept.memberCount} Anggota Aktif
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  href={`/departments/${dept.slug}`}
                  className="text-xs"
                >
                  <span>Detail Divisi</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
