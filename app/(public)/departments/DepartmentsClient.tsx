'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Code2,
  BrainCircuit,
  Palette,
  Trophy,
  ShieldCheck,
  Megaphone,
  ArrowRight,
  ChevronRight,
  Users,
  FolderGit2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const DEPT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  BrainCircuit,
  Palette,
  Trophy,
  ShieldCheck,
  Megaphone,
};

interface DepartmentItemDetailed {
  id: string;
  slug: string;
  code: string;
  name: string;
  coordinator: {
    name: string;
    role: string;
    major: string;
    batch: string;
    avatar: string;
  };
  memberCount: number;
  projectCount: number;
  shortDescription: string;
  focusAreas: string[];
  bannerPhoto: string;
  iconName: 'Code2' | 'BrainCircuit' | 'Palette' | 'Trophy' | 'ShieldCheck' | 'Megaphone';
}

const DEPARTMENTS_DATA: DepartmentItemDetailed[] = [
  {
    id: 'dept-se',
    slug: 'software-engineering',
    code: 'SE-01',
    name: 'Software Engineering',
    coordinator: {
      name: 'Dave Sumampouw',
      role: 'Koordinator Divisi',
      major: 'Informatika',
      batch: '2023',
      avatar: '/images/img/foto-1.webp',
    },
    memberCount: 28,
    projectCount: 14,
    shortDescription:
      'Pengembangan aplikasi web terdistribusi, arsitektur REST/GraphQL API, serta manajemen basis data modern berstandar industri dengan pendekatan clean code.',
    focusAreas: ['Fullstack Web', 'Cloud Architecture', 'Relational DB', 'Open Source'],
    bannerPhoto: '/images/img/foto-4.webp',
    iconName: 'Code2',
  },
  {
    id: 'dept-ai',
    slug: 'artificial-intelligence',
    code: 'AI-02',
    name: 'Artificial Intelligence & Data',
    coordinator: {
      name: 'Sarah Manoppo',
      role: 'Koordinator Divisi',
      major: 'Sistem Informasi',
      batch: '2023',
      avatar: '/images/img/foto-11.webp',
    },
    memberCount: 22,
    projectCount: 9,
    shortDescription:
      'Riset terapan kecerdasan buatan, machine learning, computer vision, dan rekayasa data untuk memecahkan persoalan nyata di kampus dan daerah.',
    focusAreas: ['Deep Learning', 'Computer Vision', 'NLP', 'Data Analytics'],
    bannerPhoto: '/images/img/foto-12.webp',
    iconName: 'BrainCircuit',
  },
  {
    id: 'dept-uiux',
    slug: 'ui-ux-design',
    code: 'UX-03',
    name: 'UI/UX & Product Design',
    coordinator: {
      name: 'Kezia Sondakh',
      role: 'Koordinator Divisi',
      major: 'Informatika',
      batch: '2024',
      avatar: '/images/img/foto-13.webp',
    },
    memberCount: 16,
    projectCount: 12,
    shortDescription:
      'Riset empati pengguna, desain interaksi ergonomis, penyusunan design tokens terstandardisasi, dan perancangan prototipe produk digital.',
    focusAreas: ['User Research', 'Design Systems', 'Usability Testing', 'Wireframing'],
    bannerPhoto: '/images/img/foto-8.webp',
    iconName: 'Palette',
  },
  {
    id: 'dept-cp',
    slug: 'competitive-programming',
    code: 'CP-04',
    name: 'Competitive Programming',
    coordinator: {
      name: 'Matthew Tambuwun',
      role: 'Koordinator Divisi',
      major: 'Informatika',
      batch: '2023',
      avatar: '/images/img/foto-16.webp',
    },
    memberCount: 18,
    projectCount: 6,
    shortDescription:
      'Pelatihan intensif struktur data tingkat lanjut, efisiensi algoritma tanding, matematika kombinatorika, dan simulasi kontes tim ICPC & GEMASTIK.',
    focusAreas: ['Algorithms', 'Data Structures', 'Math Modeling', 'ICPC Prep'],
    bannerPhoto: '/images/img/foto-7.webp',
    iconName: 'Trophy',
  },
  {
    id: 'dept-cyber',
    slug: 'cybersecurity-cloud',
    code: 'SEC-05',
    name: 'Cybersecurity & Cloud Infrastructure',
    coordinator: {
      name: 'Kevin Kalangi',
      role: 'Koordinator Divisi',
      major: 'Informatika',
      batch: '2023',
      avatar: '/images/img/foto-17.webp',
    },
    memberCount: 14,
    projectCount: 8,
    shortDescription:
      'Pengujian penetrasi etis, audit kerentanan aplikasi web, proteksi data Row-Level Security, serta konfigurasi pipeline DevOps dan server cloud.',
    focusAreas: ['Penetration Testing', 'Cloud DevOps', 'Network Defense', 'CTF Training'],
    bannerPhoto: '/images/img/foto-2.webp',
    iconName: 'ShieldCheck',
  },
  {
    id: 'dept-pr',
    slug: 'public-relations',
    code: 'PR-06',
    name: 'Public Relations & Community',
    coordinator: {
      name: 'Rachel Runtu',
      role: 'Koordinator Divisi',
      major: 'Sistem Informasi',
      batch: '2024',
      avatar: '/images/img/foto-10.webp',
    },
    memberCount: 12,
    projectCount: 15,
    shortDescription:
      'Membangun hubungan kemitraan dengan industri teknologi, mengelola publikasi media sosial, serta menyelenggarakan temu alumni dan workshop.',
    focusAreas: ['Industry Linkage', 'Community Talks', 'Media Relations', 'Event Hosting'],
    bannerPhoto: '/images/img/foto-14.webp',
    iconName: 'Megaphone',
  },
];

export function DepartmentsClient() {
  const [selectedDeptSlug, setSelectedDeptSlug] = useState<string>('software-engineering');

  const activeDept =
    DEPARTMENTS_DATA.find((d) => d.slug === selectedDeptSlug) ||
    DEPARTMENTS_DATA[0];

  const IconComp = DEPT_ICON_MAP[activeDept.iconName] || Code2;

  return (
    <div className="py-16 md:py-24 px-6 md:px-8 max-w-7xl mx-auto w-full space-y-16">
      {/* Header Halaman */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-bold text-primary tracking-wider uppercase bg-primary-50 px-3 py-1 rounded-full">
          Divisi & Departemen UVICS
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
          Pilar Keilmuan & <span className="text-primary">Divisi Riset Teknologi</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          UVICS memfasilitasi minat dan potensi teknologi mahasiswa Fakultas Ilmu Komputer UNKLAB melalui enam
          divisi spesialisasi. Setiap divisi memiliki silabus mandiri, riset terapan, dan bimbingan kompetisi intensif.
        </p>
      </div>

      {/* Interactive Tabbed Division Studio (Opsi B) */}
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Horizontal Navigation Pills */}
        <div className="flex gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
          {DEPARTMENTS_DATA.map((dept) => (
            <button
              key={dept.id}
              type="button"
              onClick={() => setSelectedDeptSlug(dept.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedDeptSlug === dept.slug
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>

        {/* Big Showcase Studio Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Division Photo & Coordinator */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-gray-100 shadow-xs">
                <Image
                  src={activeDept.bannerPhoto}
                  alt={activeDept.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-primary text-white shadow-xs">
                    {activeDept.code}
                  </span>
                </div>
              </div>

              {/* Coordinator Mini Card */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-200 shadow-2xs">
                  <Image
                    src={activeDept.coordinator.avatar}
                    alt={activeDept.coordinator.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase block">
                    Koordinator Divisi
                  </span>
                  <h3 className="text-sm font-bold text-gray-900">
                    {activeDept.coordinator.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {activeDept.coordinator.major} • Angkatan {activeDept.coordinator.batch}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Division Details & Focus */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center">
                  <IconComp className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-heading">
                  {activeDept.name}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {activeDept.shortDescription}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Bidang Kajian Utama:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeDept.focusAreas.map((f) => (
                    <span
                      key={f}
                      className="px-3 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-xs font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Anggota Aktif:</span>
                  <span className="text-base font-bold text-gray-900 font-heading flex items-center gap-1.5 mt-0.5">
                    <Users className="w-4 h-4 text-primary" />
                    {activeDept.memberCount} Mahasiswa
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Proyek Berjalan:</span>
                  <span className="text-base font-bold text-primary font-heading flex items-center gap-1.5 mt-0.5">
                    <FolderGit2 className="w-4 h-4 text-primary" />
                    {activeDept.projectCount} Inisiatif
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  href={`/departments/${activeDept.slug}`}
                >
                  <span>Buka Halaman Lengkap Divisi</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Ringkasan 6 Divisi di Bawah (Mudah Dipindai) */}
      <div className="space-y-6 pt-8 border-t border-gray-200">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900 font-heading">
            Daftar Seluruh Departemen
          </h2>
          <p className="text-xs text-gray-500">
            Klik divisi untuk melihat detail silabus dan proyek yang sedang dikembangkan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS_DATA.map((dept) => {
            const Icon = DEPT_ICON_MAP[dept.iconName] || Code2;

            return (
              <div
                key={dept.id}
                onClick={() => setSelectedDeptSlug(dept.slug)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  selectedDeptSlug === dept.slug
                    ? 'bg-white border-primary shadow-md ring-2 ring-primary/20'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-400">
                      {dept.code}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 font-heading">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {dept.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Lead: <strong className="text-gray-800">{dept.coordinator.name}</strong></span>
                  <Link
                    href={`/departments/${dept.slug}`}
                    className="text-primary font-semibold hover:underline flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Detail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
