"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Handshake,
  GraduationCap,
  Briefcase,
  Users2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { PartnerItem, UVICS_PARTNERS } from "@/data/mock/partners";
import { Button } from "@/components/ui/Button";

interface PartnersSectionProps {
  partners?: PartnerItem[];
}

/**
 * Seksi 12: Partners & Collaborator Network (Continuous Logo Strip & 3-Pillar Ecosystem Mosaic)
 * Menampilkan baris logo kolaborator terpadu di bagian atas dengan slot logo monogram institusi,
 * didampingi 3 kartu pilar ekosistem (Akademik, Industri, Komunitas) yang menjabarkan kontribusi nyata.
 */
export function PartnersSection({
  partners = UVICS_PARTNERS,
}: PartnersSectionProps) {
  const pillars = [
    {
      title: "Pilar Akademik & Pembinaan Nasional",
      icon: GraduationCap,
      description: "Kolaborasi intensif dengan Fakultas Ilmu Komputer UNKLAB dan Puspresnas Kemdikbudristek dalam mengawal delegasi mahasiswa ke ajang kompetisi nasional resmi.",
      collaborators: ["Fakultas Ilmu Komputer UNKLAB", "Puspresnas Kemdikbudristek RI"],
      highlights: ["Fasilitas Lab Komputasi 24/7", "Bimbingan Dosen Ahli", "Ekuivalensi SKS Kegiatan Mandiri"],
    },
    {
      title: "Pilar Industri & Cloud Enterprise",
      icon: Briefcase,
      description: "Kemitraan strategis bersama Google, Dicoding, MikroTik, dan GitHub Campus untuk sertifikasi profesi internasional serta akses tools developer tingkat lanjut.",
      collaborators: ["Google Developer Groups", "Dicoding Indonesia", "MikroTik Academy", "GitHub Campus"],
      highlights: ["Sertifikasi Kompetensi Industri", "Akses Cloud & Dev Credits", "Peluang Fast-Track Karir"],
    },
    {
      title: "Pilar Komunitas & Transformasi Publik",
      icon: Users2,
      description: "Sinergi dengan pemerintah daerah dan komunitas tech regional untuk menghasilkan solusi perangkat lunak yang menjawab persoalan nyata masyarakat.",
      collaborators: ["Diskominfo Sulawesi Utara", "AWS Cloud Club UNKLAB"],
      highlights: ["Digitalisasi Layanan Publik", "Workshop Terbuka Regional", "Proyek Open-Source Komunitas"],
    },
  ];

  return (
    <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header Seksi */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary-50 text-primary text-xs font-bold uppercase tracking-wider">
            <Handshake className="w-3.5 h-3.5" />
            <span>Ekosistem Riset Terpadu</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
            Sinergi Tiga Pilar <span className="text-primary">Kolaborasi</span>
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Menghubungkan keunggulan akademik, standar industri modern, dan dampak sosial melalui jejaring mitra strategis UVICS.
          </p>
        </div>

        <div className="shrink-0">
          <Button variant="outline" size="md" href="/contact?topic=partnership">
            <span>Inisiasi Kemitraan Baru</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Baris Strip Logo Terpadu (Logo Marks Strip) */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs mb-12">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
            Logo & Lembaga Kolaborator Resmi:
          </span>
          <span className="text-xs text-primary font-semibold">
            {partners.length} Mitra Aktif
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {partners.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 hover:border-primary/50 hover:bg-primary-50/20 transition-all flex flex-col items-center justify-center text-center group"
            >
              {/* Logo Slot Monogram */}
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-center text-primary font-bold font-mono text-xs mb-2 group-hover:scale-105 transition-transform">
                {item.logoMonogram}
              </div>
              <span className="text-[11px] font-bold text-gray-900 truncate max-w-full leading-tight font-heading">
                {item.name.split(" ")[0]}
              </span>
              <span className="text-[9px] text-gray-400 truncate max-w-full">
                {item.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Pilar Ekosistem Kolaborasi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {pillars.map((pillar, idx) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="p-8 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center">
                <pillar.icon className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors font-heading">
                {pillar.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {pillar.description}
              </p>

              {/* Rincian Mitra yang Tergabung */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono block">
                  Mitra Tergabung:
                </span>
                <div className="text-xs font-semibold text-gray-800">
                  {pillar.collaborators.join(" • ")}
                </div>
              </div>

              {/* Poin Keuntungan */}
              <div className="space-y-2 pt-2">
                {pillar.highlights.map((hl, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-primary">
              <span>Program Kolaborasi Aktif</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
