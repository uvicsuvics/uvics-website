import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Trophy,
  Laptop,
  Rocket,
  Presentation,
  Compass,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { UVICS_PROGRAMS, ProgramItem } from "@/data/mock/programs";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Program Kerja & Aktivitas Unggulan | UVICS UNKLAB",
  description:
    "Siklus pembinaan talenta Informatika UVICS: dari workshop fondasi, kolaborasi produk, mentoring kompetisi, hingga panggung prestasi.",
};

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

export default function ProgramsListingPage() {
  return (
    <div className="min-h-screen py-16 md:py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header Halaman */}
      <div className="max-w-3xl mb-16 space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
          Program Kerja & <span className="text-primary">Aktivitas Rutin</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          Dari penguasaan fondasi pemrograman hingga panggung kejuaraan nasional, setiap inisiatif UVICS dirancang berkesinambungan untuk membentuk talenta unggul di Universitas Klabat.
        </p>
      </div>

      {/* Grid Program */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {UVICS_PROGRAMS.map((item) => {
          const IconComp = PROGRAM_ICONS[item.iconName] || Trophy;

          return (
            <div
              key={item.id}
              className="p-8 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary flex items-center justify-center">
                    <IconComp className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-400">
                    FASE-{item.stepNumber}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-primary block">
                    {item.category} • {item.frequency}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors font-heading">
                    <Link href={`/programs/${item.slug}`}>
                      {item.title}
                    </Link>
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-700">Target Capaian:</span>{" "}
                      <span className="text-gray-900 font-medium">{item.keyOutput}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  href={`/programs/${item.slug}`}
                  className="w-full text-xs"
                >
                  <span>Pelajari Silabus Program</span>
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
