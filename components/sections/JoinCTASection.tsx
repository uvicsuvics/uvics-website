"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
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
  layoutVariant?: "banner" | "bento";
}

/**
 * Seksi 13: Join UVICS Final CTA
 * Menyajikan ajakan pendaftaran anggota baru secara elegan dan berwibawa:
 * - Varian 'banner' (Default): Banner eksekutif penuh dengan kartu rounded-xl, tipografi Playfair Display yang kuat,
 *   dan kontras tombol tinggi (Kuning secondary di atas Biru primary) bebas dari elemen 'AI slop'.
 * - Varian 'bento': Format dua kolom proporsional (Brand Action di kiri, Keuntungan & Persyaratan di kanan)
 *   yang telah dibersihkan sesuai token design.md.
 */
export function JoinCTASection({
  recruitment = CURRENT_RECRUITMENT,
  layoutVariant = "bento",
}: JoinCTASectionProps) {
  const isOpen = recruitment.status === "open";

  if (layoutVariant === "bento") {
    return (
      <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Kolom Kiri: Action Card Primer */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-7 rounded-xl bg-primary text-white p-8 sm:p-12 shadow-md flex flex-col justify-between border border-primary-700"
          >
            <div className="space-y-6">
              {/* Status Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold w-fit">
                {isOpen ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-secondary" />
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
                <p className="text-sm sm:text-base text-primary-100 max-w-xl leading-relaxed">
                  {recruitment.subheadline}
                </p>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-white/10 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {isOpen ? (
                  <>
                    <Button
                      variant="secondary"
                      size="lg"
                      href={recruitment.registrationUrl}
                      className="font-bold shadow-sm"
                    >
                      <span>Daftar Anggota Baru</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
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

              <p className="text-xs text-primary-200 flex flex-wrap items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span>{recruitment.deadlineText}</span>
                <span>•</span>
                <span>{recruitment.targetAudience}</span>
              </p>
            </div>
          </motion.div>

          {/* Kolom Kanan: Keuntungan & Persyaratan Terstruktur */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 sm:p-8 rounded-xl bg-white border border-gray-200 shadow-xs space-y-4"
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
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{b}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 sm:p-8 rounded-xl bg-gray-50 border border-gray-200 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Persyaratan Utama:
                </h4>
                <span className="text-xs font-bold text-primary">GRATIS</span>
              </div>

              <ul className="text-xs text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Mahasiswa aktif Fakultas Ilmu Komputer UNKLAB
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Memiliki komitmen belajar & mengikuti rangkaian riset
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Terbuka bagi pemula maupun yang sudah berpengalaman
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/join"
                  className="text-xs font-bold text-primary inline-flex items-center gap-1 hover:underline"
                >
                  <span>Pelajari Alur Rekrutmen Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Varian Default: Clean Executive Banner (Full-Width Card)
  return (
    <section className="py-20 sm:py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="rounded-xl bg-primary text-white p-8 sm:p-14 lg:p-16 shadow-lg border border-primary-700 relative overflow-hidden flex flex-col items-center text-center"
      >
        <div className="max-w-3xl space-y-6 flex flex-col items-center">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold w-fit">
            {isOpen ? (
              <>
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-secondary font-bold">PENDAFTARAN DIBUKA:</span>
                <span>{recruitment.batchName}</span>
              </>
            ) : (
              <span className="text-gray-300">Pendaftaran Periode Ini Telah Ditutup</span>
            )}
          </div>

          {/* Heading & Subheading */}
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-heading leading-tight text-balance">
              {recruitment.headline}
            </h2>
            <p className="text-base sm:text-lg text-primary-100 max-w-2xl leading-relaxed">
              {recruitment.subheadline}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {isOpen ? (
              <>
                <Button
                  variant="secondary"
                  size="lg"
                  href={recruitment.registrationUrl}
                  className="font-bold shadow-md"
                >
                  <span>Daftar Anggota Baru</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
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

          {/* Meta Note */}
          <div className="pt-6 border-t border-white/10 w-full max-w-xl">
            <p className="text-xs text-primary-200 flex flex-wrap items-center justify-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>{recruitment.deadlineText}</span>
              <span className="hidden sm:inline">•</span>
              <span>{recruitment.targetAudience}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
