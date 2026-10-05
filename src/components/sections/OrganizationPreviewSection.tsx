"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { IconBrandLinkedin, IconBrandGithub } from "@tabler/icons-react";
import { CabinetPeriod, CURRENT_CABINET } from "@/src/data/mock/organization";
import { Button } from "@/src/components/atoms/Button/Button";

interface OrganizationPreviewSectionProps {
  cabinet?: CabinetPeriod;
}

/**
 * Seksi 11: Current Organization Preview (Executive Cabinet Leadership Cards)
 * Menampilkan 4 pilar pengurus harian (BPH: Ketua, Wakil, Sekretaris, Bendahara)
 * dengan banner periode kabinet resmi dan kartu profil kepemimpinan yang berwibawa.
 */
export function OrganizationPreviewSection({
  cabinet = CURRENT_CABINET,
}: OrganizationPreviewSectionProps) {
  return (
    <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header Seksi */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
            Kepemimpinan <span className="text-primary">Periode Aktif</span>
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Nakhoda {cabinet.cabinetName} ({cabinet.periodName}) yang mengawal
            visi riset, pembinaan talenta, dan sinergi kolaborasi mahasiswa Ilmu
            Komputer Universitas Klabat.
          </p>
        </div>

        <div className="shrink-0">
          <Button variant="outline" size="md" href="/organization">
            <span>Struktur Organisasi Lengkap</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Grid 4 Pengurus Inti (President, Vice, Secretary, Treasurer) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cabinet.officers.map((officer, idx) => (
          <motion.div
            key={officer.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="rounded-3xl bg-white border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Foto Potret Pengurus */}
              <div className="relative h-72 w-full overflow-hidden bg-gray-100">
                <Image
                  src={officer.image}
                  alt={officer.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />

                {/* Badge Jabatan */}
                <div className="absolute top-4 left-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary text-gray-950 shadow-xs">
                    {officer.role}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-lg font-bold font-heading leading-tight">
                    {officer.name}
                  </h3>
                  <p className="text-xs text-gray-300 font-mono">
                    {officer.major}
                  </p>
                </div>
              </div>

              {/* Kutipan Visi / Filosofi */}
              <div className="p-5 space-y-3">
                <p className="text-xs text-gray-600 italic leading-relaxed line-clamp-3">
                  &ldquo;{officer.quote}&rdquo;
                </p>
              </div>
            </div>

            {/* Tautan Media Sosial Pengurus */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                {officer.roleTitle}
              </span>

              <div className="flex items-center gap-2">
                {officer.linkedinUrl && (
                  <Link
                    href={officer.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors"
                    aria-label={`LinkedIn ${officer.name}`}
                  >
                    <IconBrandLinkedin className="w-4 h-4" />
                  </Link>
                )}
                {officer.githubUrl && (
                  <Link
                    href={officer.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    aria-label={`GitHub ${officer.name}`}
                  >
                    <IconBrandGithub className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
