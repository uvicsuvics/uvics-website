"use client";

import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { CabinetPeriod, CURRENT_CABINET } from "@/data/mock/organization";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface OrganizationPreviewSectionProps {
  cabinet?: CabinetPeriod;
}

/**
 * Seksi 11: Current Organization Preview (Executive Cabinet Leadership Cards)
 * Menampilkan 4 pilar pengurus harian (BPH: Ketua, Wakil, Sekretaris, Bendahara)
 * dengan kartu profil kepemimpinan yang berwibawa, patuh D02, dan ramah aksesibilitas.
 */
export function OrganizationPreviewSection({
  cabinet = CURRENT_CABINET,
}: OrganizationPreviewSectionProps) {
  const officers = cabinet?.officers ?? [];

  return (
    <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header Seksi */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
            Kepemimpinan <span className="text-primary">Periode Aktif</span>
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Nakhoda {cabinet.cabinetName ? `${cabinet.cabinetName} ` : ""}({cabinet.periodName || "Periode Aktif"}) yang mengawal visi riset,
            pembinaan talenta, dan sinergi kolaborasi mahasiswa Ilmu Komputer Universitas Klabat.
          </p>
        </div>

        <div className="shrink-0">
          <Button variant="outline" size="md" href="/organization">
            <span>Struktur Organisasi Lengkap</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Grid 4 Pengurus Inti atau Empty State */}
      {officers.length === 0 ? (
        <EmptyState
          title="Data Kepengurusan Belum Tersedia"
          message="Informasi kepengurusan pimpinan aktif untuk periode ini belum dipublikasikan."
          action={
            <Button variant="outline" size="sm" href="/organization">
              Lihat Arsip Periode Organisasi
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {officers.map((officer, idx) => {
            const initials = officer.name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("");

            return (
              <motion.div
                key={officer.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-xl bg-white border border-gray-200 p-6 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex shrink-0 items-center justify-center overflow-hidden w-12 h-12 font-bold text-base text-primary bg-primary-50 rounded-full border border-primary-100">
                      <span aria-hidden="true">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-secondary text-gray-950 mb-1">
                        {officer.role}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 font-heading truncate">
                        {officer.name}
                      </h3>
                      <p className="text-xs text-primary font-semibold">
                        {officer.roleTitle}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>Badan Pengurus Harian</span>
                  <span className="text-primary font-semibold">UVICS FIK</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
