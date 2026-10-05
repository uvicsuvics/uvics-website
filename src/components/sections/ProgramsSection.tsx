"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Laptop,
  Rocket,
  Presentation,
  Compass,
  Users,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { ProgramItem, UVICS_PROGRAMS } from "@/src/data/mock/programs";
import { Button } from "@/src/components/atoms/Button/Button";

export interface ProgramsSectionProps {
  programs?: ProgramItem[];
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

/**
 * Seksi 5: Programs / What We Do (Homepage)
 * Mengimplementasikan Konsep 1: Modern Interactive Pathway Timeline.
 * Menyajikan seluruh pilar aktivitas UVICS sebagai alur 'Siklus Inkubasi Talenta' (Fase 01 - 06),
 * dilengkapi navigator tahapan interaktif dan spotlight card mendalam.
 */
export function ProgramsSection({
  programs = UVICS_PROGRAMS,
}: ProgramsSectionProps) {
  const [activeStep, setActiveStep] = useState<number>(0);

  // Empty state handling
  if (!programs || programs.length === 0) {
    return (
      <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
          <p className="text-sm font-medium text-gray-500">
            Daftar program kerja sedang disiapkan.
          </p>
        </div>
      </section>
    );
  }

  const activeProgram = programs[activeStep] || programs[0];
  const ActiveIcon = PROGRAM_ICONS[activeProgram.iconName] || Trophy;

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
            Program Kerja &{" "}
            <span className="text-primary">Aktivitas Rutin</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="text-base text-gray-600 leading-relaxed"
          >
            Dari penguasaan fondasi pemrograman hingga panggung kejuaraan
            nasional, setiap inisiatif dirancang berkesinambungan untuk
            membentuk talenta unggul.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="shrink-0"
        >
          <Button variant="outline" size="md" href="/programs">
            <span>Lihat Semua Program</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>

      {/* Bar Indikator Alur Tahapan (Horizontal Navigator) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        className="mb-12 p-3 rounded-2xl bg-white border border-gray-200 shadow-xs overflow-x-auto no-scrollbar"
      >
        <div className="flex items-center min-w-[640px] justify-between gap-2">
          {programs.map((prog, index) => {
            const isActive = activeStep === index;
            const IconComp = PROGRAM_ICONS[prog.iconName] || Trophy;

            return (
              <button
                key={prog.id}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`flex-1 py-3 px-4 rounded-xl text-left transition-all duration-200 flex items-center gap-3 group ${
                  isActive
                    ? "bg-primary text-white shadow-primary"
                    : "bg-transparent text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span
                    className={`text-[10px] font-mono uppercase block ${
                      isActive ? "text-white/80" : "text-gray-400"
                    }`}
                  >
                    Fase {prog.stepNumber}
                  </span>
                  <span
                    className={`text-xs font-bold truncate block ${
                      isActive ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {prog.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Spotlight Card untuk Program Terpilih */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeProgram.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="rounded-3xl bg-white border border-gray-200 p-8 sm:p-12 shadow-sm mb-16 relative overflow-hidden"
        >
          {/* Aksen Latar Belakang */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-50/60 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sisi Kiri: Deskripsi & Rincian */}
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-primary-50 text-primary">
                  FASE {activeProgram.stepNumber} / 06
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary/30 text-gray-900">
                  {activeProgram.category}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1.5 ml-auto sm:ml-0">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {activeProgram.frequency}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-heading">
                {activeProgram.title}
              </h3>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {activeProgram.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Capaian / Target Utama
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{activeProgram.keyOutput}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Sasaran Peserta
                  </span>
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-800">
                    <Users className="w-4 h-4 text-primary shrink-0" />
                    <span>{activeProgram.targetAudience}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Call to Action Mini Panel */}
            <div className="lg:col-span-4 p-6 sm:p-8 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary text-white mx-auto flex items-center justify-center shadow-primary">
                <ActiveIcon className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  {activeProgram.tagline}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Daftar agenda & jadwal kegiatan resmi terbuka bagi seluruh
                  member.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                href={`/programs/${activeProgram.slug}`}
                className="w-full"
              >
                <span>Pelajari Silabus Program</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
