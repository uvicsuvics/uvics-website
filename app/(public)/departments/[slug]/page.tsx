import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Code2,
  BrainCircuit,
  Palette,
  Trophy,
  ShieldCheck,
  Megaphone,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  UserCheck,
} from "lucide-react";
import { UVICS_DEPARTMENTS, DepartmentItem } from "@/data/mock/departments";
import { UVICS_PROJECTS } from "@/data/mock/projects";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const DEPT_ICONS: Record<
  DepartmentItem["iconName"],
  React.ComponentType<{ className?: string }>
> = {
  Code2,
  BrainCircuit,
  Palette,
  Trophy,
  ShieldCheck,
  Megaphone,
};

export async function generateStaticParams() {
  return UVICS_DEPARTMENTS.map((dept) => ({
    slug: dept.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dept = UVICS_DEPARTMENTS.find((d) => d.slug === slug);

  if (!dept) {
    return {
      title: "Departemen Tidak Ditemukan | UVICS UNKLAB",
      description: "Informasi divisi atau departemen yang dicari tidak tersedia.",
    };
  }

  return {
    title: `${dept.name} | Departemen UVICS UNKLAB`,
    description: dept.shortDescription,
  };
}

export default async function DepartmentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const dept = UVICS_DEPARTMENTS.find((d) => d.slug === slug);

  if (!dept) {
    notFound();
  }

  const IconComp = DEPT_ICONS[dept.iconName] || Code2;

  // Proyek terkait berdasarkan kesesuaian kategori
  const relatedProjects = UVICS_PROJECTS.filter((p) => {
    if (dept.slug === "software-engineering") return p.category === "Web Platform" || p.category === "Mobile App";
    if (dept.slug === "artificial-intelligence") return p.category === "Artificial Intelligence";
    if (dept.slug === "ui-ux-design") return p.category === "Design System";
    if (dept.slug === "cybersecurity-cloud") return p.category === "Cybersecurity";
    return true;
  }).slice(0, 2);

  return (
    <div className="min-h-screen py-12 md:py-20 px-6 md:px-8 max-w-6xl mx-auto w-full">
      {/* Tombol Kembali */}
      <div className="mb-8">
        <Link
          href="/departments"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Departemen</span>
        </Link>
      </div>

      {/* Header Divisi */}
      <div className="p-8 sm:p-12 rounded-3xl bg-linear-to-b from-gray-50 to-white border border-gray-200 space-y-6 mb-12 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary text-white flex items-center justify-center shadow-primary shrink-0">
            <IconComp className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest block">
              Divisi Resmi UVICS FIK UNKLAB
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
              {dept.name}
            </h1>
          </div>
        </div>

        <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl">
          {dept.description}
        </p>

        {/* Metrik Divisi */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Anggota Aktif
            </span>
            <p className="text-2xl font-bold text-gray-900 font-heading">
              {dept.memberCount}+
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Proyek Dibuat
            </span>
            <p className="text-2xl font-bold text-gray-900 font-heading">
              {dept.projectsCount}+
            </p>
          </div>

          <div className="space-y-1 col-span-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Kepala Divisi
            </span>
            <p className="text-base font-bold text-gray-900">
              {dept.coordinator}
            </p>
            <p className="text-xs text-primary font-medium">
              {dept.coordinatorRole}
            </p>
          </div>
        </div>
      </div>

      {/* Grid 2 Kolom: Fokus Silabus & Profil Kepemimpinan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14 items-start">
        {/* Kolom Kiri: Kurikulum & Fokus Pembinaan (7 Kolom) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 font-heading">
              Fokus Keahlian & Silabus Pelatihan
            </h2>
            <p className="text-sm text-gray-600">
              Setiap anggota divisi dibimbing melalui kurikulum berbasis hands-on project terstruktur sepanjang tahun.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dept.focusAreas.map((area, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-gray-200 flex items-start gap-3.5 shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {area}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Praktik implementasi berkala dengan bimbingan mentor senior divisi.
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Aktivitas Rutin Divisi */}
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <BookOpen className="w-4 h-4" />
              <span>Sesi Belajar & Code Review Mingguan</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Pertemuan rutin diadakan seminggu sekali di Lab Komputer FIK UNKLAB untuk bedah studi kasus, evaluasi pull request proyek, dan persiapan kompetisi resmi.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Mentorship & Bergabung (5 Kolom) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 space-y-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-50 text-primary flex items-center justify-center shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 font-heading">
                  Mentorship & Kolaborasi
                </h3>
                <p className="text-xs text-gray-500">
                  Didampingi oleh mahasiswa berprestasi & alumni industri
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Bergabung di divisi ini memberikan kesempatan untuk belajar langsung dari mentor yang telah memenangkan berbagai kompetisi nasional seperti GEMASTIK, ICPC, dan Hackathon.
            </p>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <Button
                variant="primary"
                size="md"
                href="/join"
                className="w-full text-xs font-semibold"
              >
                <span>Daftar Jadi Anggota Divisi</span>
              </Button>
              <Button
                variant="outline"
                size="md"
                href="/contact"
                className="w-full text-xs"
              >
                <span>Hubungi Pengurus Divisi</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Proyek Pilihan Divisi */}
      {relatedProjects.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 font-heading">
                Karya Proyek Divisi
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Inovasi yang telah dirancang dan diluncurkan oleh anggota divisi {dept.name}.
              </p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua Proyek</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedProjects.map((project) => (
              <div
                key={project.id}
                className="p-6 rounded-2xl bg-white border border-gray-200 flex flex-col justify-between space-y-4 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-semibold text-primary uppercase">
                    {project.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 font-heading">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {project.shortDescription}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
