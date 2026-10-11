'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Users,
  ChevronRight,
  Code2,
  BrainCircuit,
  Palette,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Trophy,
  Laptop,
  Rocket,
  Compass,
  Megaphone,
  Check,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { IconBrandGithub, IconBrandLinkedin } from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';
import {
  MOCK_PERIODS,
  MOCK_ORGANIZATION_2025_2026,
  MOCK_ORGANIZATION_2024_2025,
} from '@/lib/mock-data/organization';

type ActiveModule = 'programs' | 'departments' | 'organization';
type OrgConcept = 'bento' | 'tabs' | 'empty';
type ProgramConcept = 'bento-showcase' | 'clean-cards' | 'split-spotlight';
type DeptConcept = 'bento-spotlight' | 'tabbed-studio' | 'clean-pillars';

const DEPT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  BrainCircuit,
  Palette,
  ShieldCheck,
  Trophy,
  Megaphone,
};

const PROG_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy,
  Laptop,
  Rocket,
  Compass,
  Users,
};

/* =========================================================================
   REALISTIC CLEAN DATA: PROGRAMS
   ========================================================================= */
interface ProgramDisplayItem {
  id: string;
  slug: string;
  title: string;
  category: 'Kompetisi' | 'Pelatihan' | 'Inovasi' | 'Showcase' | 'Komunitas';
  frequency: string;
  targetAudience: string;
  keyOutput: string;
  description: string;
  photo: string;
  iconName: 'Trophy' | 'Laptop' | 'Rocket' | 'Compass' | 'Users';
  isFlagship?: boolean;
}

const CLEAN_PROGRAMS: ProgramDisplayItem[] = [
  {
    id: 'prog-mentoring',
    slug: 'competition-mentoring',
    title: 'Competition Mentoring & Intensive Prep',
    category: 'Kompetisi',
    frequency: 'Mingguan & Menjelang Lomba',
    targetAudience: 'Delegasi Lomba & Mahasiswa FIK',
    keyOutput: '15+ Juara Nasional & Finalis GEMASTIK',
    description:
      'Pendampingan intensif bersama mentor berpengalaman untuk mematangkan konsep prototipe, optimasi algoritma, serta simulasi pitching delegasi UVICS di ajang nasional.',
    photo: '/images/img/foto-1.webp',
    iconName: 'Trophy',
    isFlagship: true,
  },
  {
    id: 'prog-workshops',
    slug: 'internal-workshops',
    title: 'Tech Workshops & Hands-on Bootcamps',
    category: 'Pelatihan',
    frequency: 'Dwi-mingguan (Bi-weekly)',
    targetAudience: 'Seluruh Anggota Aktif',
    keyOutput: 'Penguasaan Modern Tech Stack & Portofolio',
    description:
      'Pelatihan terstruktur di laboratorium FIK UNKLAB yang mengupas Next.js, Cloud APIs, Machine Learning, dan praktik clean code yang relevan dengan kebutuhan industri software terkini.',
    photo: '/images/img/foto-3.webp',
    iconName: 'Laptop',
    isFlagship: true,
  },
  {
    id: 'prog-incubation',
    slug: 'project-collaboration',
    title: 'Project Collaboration & Product Incubation',
    category: 'Inovasi',
    frequency: 'Semesteran (Proyek Berjalan)',
    targetAudience: 'Tim Multi-Disiplin Departemen',
    keyOutput: 'Solusi Digital Terapan & Repo Terbuka',
    description:
      'Wadah kolaborasi lintas departemen di mana software engineer, AI researcher, dan UI/UX designer bergabung untuk membangun produk digital terapan untuk kampus dan ekosistem open source.',
    photo: '/images/img/foto-4.webp',
    iconName: 'Rocket',
  },
  {
    id: 'prog-showcase',
    slug: 'achievement-showcase',
    title: 'Achievement & Demo Showcase Day',
    category: 'Showcase',
    frequency: 'Akhir Setiap Semester',
    targetAudience: 'Sivitas Akademika UNKLAB & Publik',
    keyOutput: 'Pameran Karya Terbuka & Networking',
    description:
      'Etalase semesteran untuk memamerkan produk perangkat lunak buatan anggota dan merayakan raihan kejuaraan teknologi di hadapan pimpinan fakultas, dosen, dan jejaring industri.',
    photo: '/images/img/foto-14.webp',
    iconName: 'Trophy',
  },
  {
    id: 'prog-intel',
    slug: 'competition-updates',
    title: 'Competition Intelligence & Guidebook Curation',
    category: 'Kompetisi',
    frequency: 'Pembaruan Mingguan',
    targetAudience: 'Seluruh Mahasiswa FIK UNKLAB',
    keyOutput: 'Diseminasi Lomba & Pembentukan Tim',
    description:
      'Pemantauan aktif informasi kejuaraan bergengsi, bedah panduan teknis (rulebook), serta fasilitasi pembentukan tim kolaboratif lintas angkatan.',
    photo: '/images/img/foto-10.webp',
    iconName: 'Compass',
  },
  {
    id: 'prog-techtalk',
    slug: 'community-sharing',
    title: 'Community Tech Talk & Alumni Connect',
    category: 'Komunitas',
    frequency: 'Bulanan',
    targetAudience: 'Anggota, Alumni, & Mahasiswa Baru',
    keyOutput: 'Jejaring Industri & Wawasan Karier',
    description:
      'Sesi temu dan berbagi wawasan bersama alumni UVICS yang telah berkarier di perusahaan teknologi terkemuka untuk mendiskusikan tren engineering dan bimbingan karier.',
    photo: '/images/img/foto-13.webp',
    iconName: 'Users',
  },
];

/* =========================================================================
   REALISTIC CLEAN DATA: DEPARTMENTS
   ========================================================================= */
interface CleanDepartmentItem {
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

const CLEAN_DEPARTMENTS: CleanDepartmentItem[] = [
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
      'Pengembangan aplikasi web terdistribusi, arsitektur REST/GraphQL API, serta manajemen basis data modern dengan standar kode bersih.',
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
      'Riset empati pengguna, desain interaksi ergonomis, penyusunan design tokens standar, dan perancangan prototipe produk digital.',
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
      'Pelatihan intensif struktur data tingkat lanjut, efisiensi algoritma tanding, dan simulasi kontes tim ICPC & GEMASTIK.',
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
      'Pengujian penetrasi etis, audit kerentanan aplikasi, proteksi Row-Level Security, serta konfigurasi pipeline DevOps dan server cloud.',
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

export default function ReviewPage() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('programs');
  const [orgConcept, setOrgConcept] = useState<OrgConcept>('bento');
  const [progConcept, setProgConcept] = useState<ProgramConcept>('bento-showcase');
  const [deptConcept, setDeptConcept] = useState<DeptConcept>('tabbed-studio');

  // Interactive States
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('period-2025-2026');
  const [selectedProgramSlug, setSelectedProgramSlug] = useState<string>('competition-mentoring');
  const [selectedDeptSlug, setSelectedDeptSlug] = useState<string>('software-engineering');

  const currentOrgData =
    selectedPeriodId === 'period-2025-2026'
      ? MOCK_ORGANIZATION_2025_2026
      : selectedPeriodId === 'period-2024-2025'
        ? MOCK_ORGANIZATION_2024_2025
        : null;

  return (
    <div className="min-h-screen bg-neutral-50/60 pb-28 text-gray-800">
      {/* ========================================================= */}
      {/* 1. REVIEW CONTROL CENTER / STICKY TOOLBAR                 */}
      {/* ========================================================= */}
      <section
        className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs"
        aria-label="Review Toolbar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Title & Badge */}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary text-white tracking-wider">
                  Issue #25 Design Lab
                </span>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  Semua Konsep Telah Disetujui (Ready to Implement)
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 font-heading mt-0.5">
                Katalog Review Konsep Halaman UVICS
              </h1>
            </div>

            {/* Module Picker */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto border border-gray-200">
              <button
                type="button"
                onClick={() => setActiveModule('programs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeModule === 'programs'
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🚀 Program Kerja (Opsi A)
              </button>
              <button
                type="button"
                onClick={() => setActiveModule('departments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeModule === 'departments'
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏢 Departemen (Opsi B)
              </button>
              <button
                type="button"
                onClick={() => setActiveModule('organization')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeModule === 'organization'
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏛️ Organisasi (Konsep 1)
              </button>
            </div>
          </div>

          {/* Sub Toolbar: Variant Selector based on module */}
          <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              <span className="font-semibold text-gray-600 shrink-0">Pilihan Tampilan:</span>

              {/* MODULE: PROGRAMS */}
              {activeModule === 'programs' && (
                <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
                  <button
                    type="button"
                    onClick={() => setProgConcept('bento-showcase')}
                    className={`px-3 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                      progConcept === 'bento-showcase'
                        ? 'bg-primary text-white border-primary shadow-xs font-bold'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>Opsi A: Program Bento Showcase (Pilihan Anda)</span>
                    <Check className="w-3.5 h-3.5 text-secondary" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setProgConcept('clean-cards')}
                    className={`px-3 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                      progConcept === 'clean-cards'
                        ? 'bg-primary text-white border-primary shadow-xs font-bold'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>Opsi B: Editorial 3-Column Card Grid</span>
                    {progConcept === 'clean-cards' && <Check className="w-3.5 h-3.5 text-secondary" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setProgConcept('split-spotlight')}
                    className={`px-3 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                      progConcept === 'split-spotlight'
                        ? 'bg-primary text-white border-primary shadow-xs font-bold'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>Opsi C: Interactive Split Spotlight</span>
                    {progConcept === 'split-spotlight' && <Check className="w-3.5 h-3.5 text-secondary" />}
                  </button>
                </div>
              )}

              {/* MODULE: DEPARTMENTS */}
              {activeModule === 'departments' && (
                <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
                  <button
                    type="button"
                    onClick={() => setDeptConcept('tabbed-studio')}
                    className={`px-3 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                      deptConcept === 'tabbed-studio'
                        ? 'bg-primary text-white border-primary shadow-xs font-bold'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>Opsi B: Interactive Tabbed Studio (Pilihan Anda)</span>
                    <Check className="w-3.5 h-3.5 text-secondary" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeptConcept('bento-spotlight')}
                    className={`px-3 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                      deptConcept === 'bento-spotlight'
                        ? 'bg-primary text-white border-primary shadow-xs font-bold'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>Opsi A: Division Bento with Coordinator Spotlight</span>
                    {deptConcept === 'bento-spotlight' && <Check className="w-3.5 h-3.5 text-secondary" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeptConcept('clean-pillars')}
                    className={`px-3 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                      deptConcept === 'clean-pillars'
                        ? 'bg-primary text-white border-primary shadow-xs font-bold'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>Opsi C: Symmetrical 6-Card Minimalist Grid</span>
                    {deptConcept === 'clean-pillars' && <Check className="w-3.5 h-3.5 text-secondary" />}
                  </button>
                </div>
              )}

              {/* MODULE: ORGANIZATION */}
              {activeModule === 'organization' && (
                <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
                  <button
                    type="button"
                    onClick={() => setOrgConcept('bento')}
                    className={`px-3 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                      orgConcept === 'bento'
                        ? 'bg-primary text-white border-primary shadow-xs font-bold'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>Konsep 1: Executive Bento (Sudah Anda Pilih)</span>
                    <Check className="w-3.5 h-3.5 text-secondary" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrgConcept('tabs')}
                    className={`px-2.5 py-1 rounded-md border transition-all ${
                      orgConcept === 'tabs'
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Konsep 2: Department Tabs
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrgConcept('empty')}
                    className={`px-2.5 py-1 rounded-md border transition-all ${
                      orgConcept === 'empty'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    Simulasi Empty State
                  </button>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-gray-500 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Branch: <code>feature/public-programs-organization</code></span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. MAIN CONTENT CANVAS                                    */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ========================================================= */}
        {/* MODULE 1: PROGRAM KERJA (/programs)                       */}
        {/* ========================================================= */}
        {activeModule === 'programs' && (
          <div className="space-y-12">
            {/* Header Seksi Bersih & Elegan */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold text-primary tracking-wider uppercase bg-primary-50 px-3 py-1 rounded-full">
                Program Kerja & Pembinaan UVICS
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-heading">
                Aktivitas Nyata Menuju <span className="text-primary">Prestasi Teknologi</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                UVICS menyelenggarakan program pembinaan terstruktur yang memadukan pelatihan praktis hands-on,
                inkubasi produk digital terapan, bimbingan intensif delegasi kompetisi nasional, serta jejaring alumni.
              </p>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* OPSI A: PROGRAM BENTO SHOWCASE (HARMONIS DGN BENTO ORG)       */}
            {/* ------------------------------------------------------------- */}
            {progConcept === 'bento-showcase' && (
              <div className="space-y-8">
                {/* 1. Top Tier Bento: 2 Program Flagship Unggulan */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {CLEAN_PROGRAMS.slice(0, 2).map((prog) => {
                    return (
                      <div
                        key={prog.id}
                        className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group space-y-6"
                      >
                        <div className="space-y-5">
                          {/* Photo Banner with Category Tag */}
                          <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-xs border border-gray-100">
                            <Image
                              src={prog.photo}
                              alt={prog.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-primary text-white shadow-xs">
                                {prog.category}
                              </span>
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-secondary text-gray-900 shadow-xs">
                                Program Unggulan
                              </span>
                            </div>
                          </div>

                          {/* Title & Description */}
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-gray-900 font-heading group-hover:text-primary transition-colors">
                              {prog.title}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {prog.description}
                            </p>
                          </div>

                          {/* Metadata Box */}
                          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Frekuensi Pelaksanaan
                              </span>
                              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                {prog.frequency}
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                Sasaran Peserta
                              </span>
                              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                                {prog.targetAudience}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom: Key Output & CTA */}
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-primary uppercase block">
                              Target Luaran
                            </span>
                            <span className="text-xs font-bold text-gray-900">
                              {prog.keyOutput}
                            </span>
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            href={`/programs/${prog.slug}`}
                            className="text-xs"
                          >
                            <span>Detail Silabus</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Second Tier Bento: 4 Program Penunjang & Ekosistem (Grid 4 Kolom) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {CLEAN_PROGRAMS.slice(2).map((prog) => {
                    const IconComp = PROG_ICON_MAP[prog.iconName] || Trophy;

                    return (
                      <div
                        key={prog.id}
                        className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group space-y-4"
                      >
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                              <IconComp className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                              {prog.category}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-lg font-bold text-gray-900 font-heading group-hover:text-primary transition-colors line-clamp-2">
                              {prog.title}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-3 mt-1.5 leading-relaxed">
                              {prog.description}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 space-y-3">
                          <div className="text-[11px] text-gray-500">
                            <span className="font-semibold text-gray-800 block">
                              Luaran: {prog.keyOutput}
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              Ritme: {prog.frequency}
                            </span>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            href={`/programs/${prog.slug}`}
                            className="w-full text-xs justify-between group-hover:text-primary"
                          >
                            <span>Pelajari Program</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* OPSI B: EDITORIAL 3-COLUMN CARD GRID (SENADA DGN LOMBA)       */}
            {/* ------------------------------------------------------------- */}
            {progConcept === 'clean-cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {CLEAN_PROGRAMS.map((prog) => {
                  return (
                    <div
                      key={prog.id}
                      className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image Banner */}
                        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                          <Image
                            src={prog.photo}
                            alt={prog.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/95 text-primary shadow-xs backdrop-blur-xs">
                              {prog.category}
                            </span>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                          <h3 className="text-xl font-bold text-gray-900 font-heading group-hover:text-primary transition-colors line-clamp-2">
                            {prog.title}
                          </h3>

                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {prog.description}
                          </p>

                          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5 text-xs text-gray-600">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-[11px]">Frekuensi:</span>
                              <span className="font-semibold text-gray-800">{prog.frequency}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-[11px]">Sasaran:</span>
                              <span className="font-semibold text-gray-800 truncate max-w-[150px]">{prog.targetAudience}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-6 pt-0 border-t border-gray-100 mt-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">
                          {prog.keyOutput}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          href={`/programs/${prog.slug}`}
                          className="text-xs"
                        >
                          <span>Buka</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* OPSI C: INTERACTIVE SPLIT SPOTLIGHT (FOKUS & RINGKAS)         */}
            {/* ------------------------------------------------------------- */}
            {progConcept === 'split-spotlight' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left List Selector */}
                <div className="lg:col-span-5 space-y-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block pb-1 border-b border-gray-200">
                    Pilih Program Kerja
                  </span>
                  {CLEAN_PROGRAMS.map((prog) => {
                    const isSelected = selectedProgramSlug === prog.slug;
                    const IconComp = PROG_ICON_MAP[prog.iconName] || Trophy;

                    return (
                      <button
                        key={prog.id}
                        type="button"
                        onClick={() => setSelectedProgramSlug(prog.slug)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-white border-primary shadow-md ring-2 ring-primary/20'
                            : 'bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-primary text-white'
                              : 'bg-primary-50 text-primary'
                          }`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">
                            {prog.category} • {prog.frequency}
                          </span>
                          <h4 className="text-sm font-bold text-gray-900 font-heading truncate">
                            {prog.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {prog.keyOutput}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Right Spotlight Detail Card */}
                <div className="lg:col-span-7">
                  {(() => {
                    const active =
                      CLEAN_PROGRAMS.find((p) => p.slug === selectedProgramSlug) ||
                      CLEAN_PROGRAMS[0];

                    return (
                      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-sm sticky top-36">
                        <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-gray-100 shadow-xs">
                          <Image
                            src={active.photo}
                            alt={active.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 rounded-md text-xs font-bold bg-primary text-white shadow-xs">
                              {active.category}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-2xl font-bold text-gray-900 font-heading">
                            {active.title}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {active.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">
                              Target Luaran Terukur
                            </span>
                            <span className="font-bold text-gray-900 text-sm">
                              {active.keyOutput}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">
                              Peserta & Ritme
                            </span>
                            <span className="font-medium text-gray-700">
                              {active.targetAudience} ({active.frequency})
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <Button
                            variant="primary"
                            size="md"
                            href={`/programs/${active.slug}`}
                          >
                            <span>Buka Silabus Lengkap Program</span>
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 2: DEPARTEMEN (/departments)                       */}
        {/* ========================================================= */}
        {activeModule === 'departments' && (
          <div className="space-y-12">
            {/* Header Seksi Bersih & Elegan */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold text-primary tracking-wider uppercase bg-primary-50 px-3 py-1 rounded-full">
                Divisi & Departemen UVICS
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-heading">
                Pilar Keilmuan & <span className="text-primary">Divisi Riset Teknologi</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                UVICS terdiri atas 6 departemen yang membina keahlian spesifik mahasiswa Fakultas Ilmu Komputer.
                Setiap divisi dipimpin oleh koordinator mahasiswa yang mengelola silabus mandiri dan riset terapan.
              </p>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* OPSI A: DIVISION BENTO WITH COORDINATOR SPOTLIGHT             */}
            {/* ------------------------------------------------------------- */}
            {deptConcept === 'bento-spotlight' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CLEAN_DEPARTMENTS.map((dept) => {
                  const IconComp = DEPT_ICON_MAP[dept.iconName] || Code2;

                  return (
                    <div
                      key={dept.id}
                      className="p-7 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group space-y-6"
                    >
                      <div className="space-y-5">
                        {/* Header: Icon, Code & Member Count */}
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shadow-2xs">
                            <IconComp className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-primary transition-colors">
                            {dept.code}
                          </span>
                        </div>

                        {/* Title & Short Description */}
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-gray-900 font-heading group-hover:text-primary transition-colors">
                            {dept.name}
                          </h3>
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                            {dept.shortDescription}
                          </p>
                        </div>

                        {/* Focus Areas Chips */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Bidang Fokus
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {dept.focusAreas.map((area) => (
                              <span
                                key={area}
                                className="px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200/80 text-gray-700 text-[11px] font-medium"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Coordinator Card (Harmonis dengan BPH di Organisasi) */}
                        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-gray-200 shadow-2xs">
                            <Image
                              src={dept.coordinator.avatar}
                              alt={dept.coordinator.name}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-primary uppercase block">
                              Koordinator Divisi
                            </span>
                            <h4 className="text-xs font-bold text-gray-900 truncate">
                              {dept.coordinator.name}
                            </h4>
                            <p className="text-[11px] text-gray-500 truncate">
                              {dept.coordinator.major} • {dept.coordinator.batch}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom: Stats & Action */}
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          <strong className="text-gray-900">{dept.memberCount}</strong> Anggota Divisi
                        </span>

                        <Button
                          variant="ghost"
                          size="sm"
                          href={`/departments/${dept.slug}`}
                          className="text-xs group-hover:text-primary"
                        >
                          <span>Eksplorasi</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* OPSI B: INTERACTIVE TABBED DIVISION STUDIO                    */}
            {/* ------------------------------------------------------------- */}
            {deptConcept === 'tabbed-studio' && (
              <div className="space-y-8 max-w-5xl mx-auto">
                {/* Horizontal Navigation Pills */}
                <div className="flex gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
                  {CLEAN_DEPARTMENTS.map((dept) => (
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

                {/* Big Showcase Card */}
                {(() => {
                  const activeDept =
                    CLEAN_DEPARTMENTS.find((d) => d.slug === selectedDeptSlug) ||
                    CLEAN_DEPARTMENTS[0];
                  const IconComp = DEPT_ICON_MAP[activeDept.iconName] || Code2;

                  return (
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-sm space-y-8">
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
                              <h4 className="text-sm font-bold text-gray-900">
                                {activeDept.coordinator.name}
                              </h4>
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
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-heading">
                              {activeDept.name}
                            </h3>
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
                              <span className="text-base font-bold text-gray-900 font-heading">
                                {activeDept.memberCount} Mahasiswa
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[11px]">Proyek Berjalan:</span>
                              <span className="text-base font-bold text-primary font-heading">
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
                  );
                })()}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* OPSI C: SYMMETRICAL 6-CARD MINIMALIST GRID                    */}
            {/* ------------------------------------------------------------- */}
            {deptConcept === 'clean-pillars' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CLEAN_DEPARTMENTS.map((dept, idx) => {
                  const IconComp = DEPT_ICON_MAP[dept.iconName] || Code2;
                  const numStr = String(idx + 1).padStart(2, '0');

                  return (
                    <div
                      key={dept.id}
                      className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs hover:border-primary/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group space-y-6"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold font-heading text-gray-300 group-hover:text-primary transition-colors">
                            {numStr}
                          </span>
                          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                            <IconComp className="w-5 h-5" />
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-gray-900 font-heading group-hover:text-primary transition-colors">
                            {dept.name}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-3 mt-1.5 leading-relaxed">
                            {dept.shortDescription}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {dept.focusAreas.slice(0, 3).map((area) => (
                            <span
                              key={area}
                              className="px-2 py-0.5 rounded bg-gray-50 border border-gray-100 text-[11px] text-gray-600 font-medium"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          Lead: <strong className="text-gray-800">{dept.coordinator.name}</strong>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          href={`/departments/${dept.slug}`}
                          className="text-xs group-hover:text-primary"
                        >
                          <span>Detail</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 3: STRUKTUR ORGANISASI (/organization)             */}
        {/* ========================================================= */}
        {activeModule === 'organization' && (
          <div className="space-y-12">
            {/* Overview Banner */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Target Route: /organization
                  </span>
                  {orgConcept === 'bento' && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Disetujui Pengguna (Badge Kabinet Dihapus)
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-heading mt-0.5">
                  {orgConcept === 'bento' && 'Konsep 1: Executive Bento Hierarchy (Pilihan Anda)'}
                  {orgConcept === 'tabs' && 'Konsep 2: Department Tabs & Digital ID'}
                  {orgConcept === 'empty' && 'Simulasi: Empty State'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                  {orgConcept === 'bento' &&
                    'Pimpinan utama (Presiden & Wakil) disorot dengan kartu bento elegan, didukung pohon koneksi ke Sekretaris, Bendahara, dan grid divisi.'}
                </p>
              </div>

              {/* Period Switcher Simulation */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 shrink-0">
                <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 pl-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Periode:
                </span>
                <div className="flex gap-1">
                  {MOCK_PERIODS.map((period) => (
                    <button
                      key={period.id}
                      type="button"
                      onClick={() => {
                        setSelectedPeriodId(period.id);
                        if (period.status === 'UPCOMING') {
                          setOrgConcept('empty');
                        } else if (orgConcept === 'empty') {
                          setOrgConcept('bento');
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
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

            {/* KONSEP 1: BENTO HIERARCHY (CABINET PILL REMOVED) */}
            {orgConcept === 'bento' && currentOrgData && (
              <div className="space-y-12">
                {/* Hero Section (Clean - No Kabinet Pill) */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-heading">
                    Struktur Kepengurusan & <span className="text-primary">BPH UVICS</span>
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {currentOrgData.description}
                  </p>
                </div>

                {/* BPH Bento Showcase */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 font-heading">
                        Badan Pengurus Harian (BPH)
                      </h3>
                      <p className="text-xs text-gray-500">
                        Pimpinan eksekutif penggerak visi organisasi periode {currentOrgData.period.name}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Aktif Menjabat
                    </span>
                  </div>

                  {/* Top Tier: Presiden & Wakil Presiden */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <div className="space-y-6 pt-6">
                  <div className="border-b border-gray-200 pb-3">
                    <h3 className="text-xl font-bold text-gray-900 font-heading">
                      Struktur Departemen & Koordinator
                    </h3>
                    <p className="text-xs text-gray-500">
                      Divisi operasional penggerak riset dan keilmuan teknologi
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
            )}

            {/* EMPTY STATE SIMULATION */}
            {orgConcept === 'empty' && (
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
                    onClick={() => {
                      setSelectedPeriodId('period-2025-2026');
                      setOrgConcept('bento');
                    }}
                    className="text-xs"
                  >
                    <span>Kembali ke Periode Aktif (2025/2026)</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
