"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Calendar,
  Trophy,
} from "lucide-react";
import { CURRENT_RECRUITMENT, RecruitmentInfo } from "@/data/mock/recruitment";
import { Button } from "@/components/ui/Button";

interface JoinCTASectionProps {
  recruitment?: RecruitmentInfo;
}

/**
 * Seksi 13: Join UVICS Final CTA (Dual-Card Bento Recruitment Canvas)
 * Menyajikan ajakan pendaftaran dalam format bento grid asimetris:
 * Sisi kiri kanvas biru utama (primary brand) berukuran besar dengan tombol aksi pendaftaran,
 * sisi kanan dua kartu bertumpuk (keuntungan kompetitif & panduan berkas).
 */
export function JoinCTASection({
  recruitment = CURRENT_RECRUITMENT,
}: JoinCTASectionProps) {
  const isOpen = recruitment.status === "open";

  return (
    <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Kolom Kiri: Kanvas Hero Biru UVICS (7 Kolom) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="lg:col-span-7 rounded-[2.5rem] bg-gradient-to-br from-primary via-primary-800 to-primary-950 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col justify-between border border-primary-600/30"
        >
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 space-y-6">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold w-fit">
              {isOpen ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-secondary font-bold">PENDAFTARAN DIBUKA:</span>
                  <span>{recruitment.batchName}</span>
                </>
              ) : (
                <span className="text-gray-300">Pendaftaran Periode Ini Telah Ditutup</span>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-heading leading-tight">
                {recruitment.headline}
              </h2>
              <p className="text-sm sm:text-base text-primary-100 max-w-xl leading-relaxed font-light">
                {recruitment.subheadline}
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-6 border-t border-white/10 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              {isOpen ? (
                <>
                  <Button
                    variant="secondary"
                    size="xl"
                    href={recruitment.registrationUrl}
                    className="font-bold shadow-lg"
                  >
                    <span>Daftar Anggota Baru</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="xl"
                    href={recruitment.guidebookUrl}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Unduh Panduan</span>
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="lg" href="https://instagram.com/uvics">
                  <span>Ikuti Info Rekrutmen di Medsos</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            <p className="text-xs text-primary-200 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-secondary" />
              <span>{recruitment.deadlineText}</span>
              <span>•</span>
              <span>{recruitment.targetAudience}</span>
            </p>
          </div>
        </motion.div>

        {/* Kolom Kanan: 2 Kartu Bertumpuk (5 Kolom) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          {/* Kartu 1: Nilai & Dampak Nyata */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-7 rounded-[2rem] bg-white border border-gray-200 shadow-xs space-y-4"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-gray-900 font-heading">
                Keuntungan Eksklusif Anggota
              </h3>
            </div>

            <div className="space-y-3">
              {recruitment.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{b}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Kartu 2: Persyaratan Ringkas & Jadwal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-7 rounded-[2rem] bg-gray-50 border border-gray-200 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 font-mono">
                Persyaratan Utama Calon Anggota:
              </h4>
              <span className="text-xs font-bold text-primary">GRATIS</span>
            </div>

            <ul className="text-xs text-gray-600 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Mahasiswa aktif Fakultas Ilmu Komputer (Informatika / SI)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Memiliki komitmen belajar & mengikuti rangkaian kegiatan riset
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Terbuka bagi pemula maupun yang sudah berpengalaman
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/faq"
                className="text-xs font-bold text-primary inline-flex items-center gap-1 hover:underline"
              >
                <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
