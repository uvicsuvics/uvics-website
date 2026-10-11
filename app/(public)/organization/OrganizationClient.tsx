'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Calendar,
  ChevronRight,
  Code2,
  BrainCircuit,
  Palette,
  ShieldCheck,
  Trophy,
  Megaphone,
  AlertCircle,
} from 'lucide-react';
import { IconBrandGithub, IconBrandLinkedin } from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';
import {
  MOCK_PERIODS,
  MOCK_ORGANIZATION_2025_2026,
  MOCK_ORGANIZATION_2024_2025,
} from '@/lib/mock-data/organization';

const DEPT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  BrainCircuit,
  Palette,
  ShieldCheck,
  Trophy,
  Megaphone,
};

export function OrganizationClient() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('period-2025-2026');

  const currentOrgData =
    selectedPeriodId === 'period-2025-2026'
      ? MOCK_ORGANIZATION_2025_2026
      : selectedPeriodId === 'period-2024-2025'
        ? MOCK_ORGANIZATION_2024_2025
        : null;

  return (
    <div className="py-16 md:py-24 px-6 md:px-8 max-w-7xl mx-auto w-full space-y-16">
      {/* Header & Period Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold text-primary tracking-wider uppercase bg-primary-50 px-3 py-1 rounded-full">
            Struktur Kepengurusan UVICS
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
            Badan Pengurus & <span className="text-primary">Struktur Divisi</span>
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Pimpinan eksekutif dan koordinator divisi yang mengorkestrasi program riset komputasi,
            pembinaan talenta, serta delegasi kompetisi nasional di Universitas Klabat.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 shrink-0">
          <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 pl-2">
            <Calendar className="w-4 h-4 text-primary" />
            Periode:
          </span>
          <div className="flex gap-1">
            {MOCK_PERIODS.map((period) => (
              <button
                key={period.id}
                type="button"
                onClick={() => setSelectedPeriodId(period.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedPeriodId === period.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {period.name}
                {period.status === 'ACTIVE' && (
                  <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-secondary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {currentOrgData ? (
        <div className="space-y-16">
          {/* Deskripsi Periode */}
          <div className="max-w-3xl space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 font-heading">
              Kepengurusan Periode {currentOrgData.period.name}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {currentOrgData.description}
            </p>
          </div>

          {/* BPH Bento Showcase */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-heading">
                  Badan Pengurus Harian (BPH)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pimpinan eksekutif penggerak visi organisasi periode {currentOrgData.period.name}
                </p>
              </div>
              {currentOrgData.period.status === 'ACTIVE' && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Aktif Menjabat
                </span>
              )}
            </div>

            {/* Top Tier: Presiden & Wakil Presiden (Bento Highlight Cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {currentOrgData.bph.slice(0, 2).map((officer) => (
                <div
                  key={officer.id}
                  className="relative p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row gap-6 items-center group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-36 h-36 bg-primary-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform" />

                  {/* Officer Photo */}
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shrink-0 shadow-md border-2 border-primary/20 group-hover:border-primary transition-colors">
                    <Image
                      src={officer.image}
                      alt={`Foto ${officer.name}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 128px, 160px"
                    />
                  </div>

                  {/* Officer Info */}
                  <div className="space-y-3 z-10 flex-1 text-center sm:text-left">
                    <div>
                      <span className="text-xs font-bold font-mono tracking-wider text-primary uppercase">
                        {officer.role}
                      </span>
                      <h4 className="text-xl font-bold text-gray-900 font-heading group-hover:text-primary transition-colors">
                        {officer.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {officer.major} • Angkatan {officer.batch}
                      </p>
                    </div>

                    {officer.quote && (
                      <p className="text-xs text-gray-600 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        &ldquo;{officer.quote}&rdquo;
                      </p>
                    )}

                    {/* Social Links */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      {officer.linkedinUrl && (
                        <a
                          href={officer.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center text-gray-600 transition-colors"
                          aria-label={`LinkedIn ${officer.name}`}
                        >
                          <IconBrandLinkedin className="w-4 h-4" />
                        </a>
                      )}
                      {officer.githubUrl && (
                        <a
                          href={officer.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-900 hover:text-white flex items-center justify-center text-gray-600 transition-colors"
                          aria-label={`GitHub ${officer.name}`}
                        >
                          <IconBrandGithub className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Second Tier: Sekretaris & Bendahara */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentOrgData.bph.slice(2, 4).map((officer) => (
                <div
                  key={officer.id}
                  className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md transition-all flex items-center gap-4 group"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                    <Image
                      src={officer.image}
                      alt={`Foto ${officer.name}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="space-y-1 flex-1">
                    <span className="text-[11px] font-bold text-primary uppercase">
                      {officer.role}
                    </span>
                    <h4 className="text-base font-bold text-gray-900 font-heading group-hover:text-primary transition-colors">
                      {officer.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {officer.major} • Angkatan {officer.batch}
                    </p>
                    {officer.quote && (
                      <p className="text-[11px] text-gray-600 line-clamp-1 italic">
                        &ldquo;{officer.quote}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Structure Grid */}
          <div className="space-y-8 pt-4">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-heading">
                Struktur Departemen & Koordinator
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Divisi riset dan operasional penggerak keilmuan teknologi di UVICS
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentOrgData.departments.map((dept) => {
                const IconComp = DEPT_ICON_MAP[dept.iconName] || Code2;

                return (
                  <div
                    key={dept.id}
                    className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs hover:border-primary/40 hover:shadow-lg transition-all space-y-5"
                  >
                    {/* Dept Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-gray-900 font-heading">
                            {dept.name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {dept.members.length + 1} Anggota Divisi
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        href={`/departments/${dept.slug}`}
                        className="text-xs"
                      >
                        <span>Detail Divisi</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Coordinator Card */}
                    {dept.coordinator && (
                      <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                          <Image
                            src={dept.coordinator.image}
                            alt={`Foto ${dept.coordinator.name}`}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-primary uppercase block">
                            Koordinator Divisi
                          </span>
                          <h5 className="text-sm font-bold text-gray-900 truncate">
                            {dept.coordinator.name}
                          </h5>
                          <p className="text-[11px] text-gray-500 truncate">
                            {dept.coordinator.major} • {dept.coordinator.batch}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Members List */}
                    {dept.members.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-gray-700 block">
                          Anggota Aktif Divisi:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {dept.members.map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                            >
                              <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
                                <Image
                                  src={m.image}
                                  alt={`Avatar ${m.name}`}
                                  fill
                                  className="object-cover"
                                  sizes="24px"
                                />
                              </div>
                              <span className="font-medium text-gray-800">{m.name}</span>
                              <span className="text-[10px] text-gray-400">({m.role})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 sm:p-16 rounded-3xl bg-white border-2 border-dashed border-gray-200 text-center space-y-4 max-w-2xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 font-heading">
              Struktur Belum Tersedia
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Organization structure for this period is not available yet. Data kepengurusan
              periode ini sedang dalam proses pembaruan atau belum diarsipkan.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPeriodId('period-2025-2026')}
              className="text-xs"
            >
              <span>Kembali ke Periode Aktif (2025/2026)</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
