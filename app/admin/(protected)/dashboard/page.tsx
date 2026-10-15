import React from "react";
import {
  Users,
  GraduationCap,
  UserPlus,
  Newspaper,
  CalendarDays,
  Trophy,
  Activity,
} from "lucide-react";
import { requirePageAdmin } from "@/lib/auth/page";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DashboardStatCard } from "@/components/admin/dashboard/DashboardStatCard";
import { DashboardWidget } from "@/components/admin/dashboard/DashboardWidget";
import { DashboardEmptyState } from "@/components/admin/dashboard/DashboardEmptyState";

export const metadata = { title: "Dashboard Admin | UVICS" };

export default async function DashboardPage() {
  const admin = await requirePageAdmin();

  const stats = [
    {
      title: "Anggota Aktif",
      value: 0,
      description: "Total anggota aktif",
      icon: Users,
      iconColorVariant: "primary" as const,
    },
    {
      title: "Alumni",
      value: 0,
      description: "Lulusan terdata",
      icon: GraduationCap,
      iconColorVariant: "accent" as const,
    },
    {
      title: "Pendaftaran Menunggu",
      value: 0,
      description: "Perlu ditinjau",
      icon: UserPlus,
      iconColorVariant: "warning" as const,
    },
    {
      title: "Berita Terbit",
      value: 0,
      description: "Artikel dan rilis",
      icon: Newspaper,
      iconColorVariant: "primary" as const,
    },
    {
      title: "Event Mendatang",
      value: 0,
      description: "Agenda aktif",
      icon: CalendarDays,
      iconColorVariant: "accent" as const,
    },
    {
      title: "Kompetisi Dibuka",
      value: 0,
      description: "Perlombaan tersedia",
      icon: Trophy,
      iconColorVariant: "warning" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <AdminPageHeader
        title="Dashboard Admin"
        description={
          <span>
            Selamat datang kembali,{" "}
            <span className="font-semibold text-gray-800">{admin.name}</span>.
            <span className="block sm:inline sm:ml-1 text-gray-500">
              Berikut ringkasan terbaru aktivitas dan informasi UVICS.
            </span>
          </span>
        }
      />

      {/* 2. KPI Summary Cards (Compact 3x2 Grid) */}
      <section aria-labelledby="kpi-summary-title">
        <h2 id="kpi-summary-title" className="sr-only">
          Ringkasan Indikator Kinerja
        </h2>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {stats.map((stat) => (
            <DashboardStatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              iconColorVariant={stat.iconColorVariant}
            />
          ))}
        </div>
      </section>

      {/* 3. Dashboard Main Grid (Operational Widgets) */}
      <section aria-labelledby="overview-widgets-title" className="pt-1">
        <h2 id="overview-widgets-title" className="sr-only">
          Widget Ikhtisar Operasional
        </h2>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Pendaftaran Terbaru */}
          <DashboardWidget
            title="Pendaftaran Terbaru"
            description="Pendaftaran anggota terbaru yang masuk."
            className="lg:col-span-7"
          >
            <DashboardEmptyState
              icon={UserPlus}
              title="Belum ada pendaftaran terbaru."
              description="Pendaftaran baru akan muncul di sini ketika recruitment dibuka."
            />
          </DashboardWidget>

          {/* Event Mendatang */}
          <DashboardWidget
            title="Event Mendatang"
            description="Agenda dan kegiatan UVICS yang akan datang."
            className="lg:col-span-5"
          >
            <DashboardEmptyState
              icon={CalendarDays}
              title="Belum ada event mendatang."
              description="Event yang dijadwalkan akan muncul di sini."
            />
          </DashboardWidget>

          {/* Berita Terbaru */}
          <DashboardWidget
            title="Berita Terbaru"
            description="Publikasi artikel dan pengumuman terbaru."
            className="lg:col-span-6"
          >
            <DashboardEmptyState
              icon={Newspaper}
              title="Belum ada berita yang dipublikasikan."
              description="Artikel atau rilis berita baru akan muncul di sini setelah diterbitkan."
            />
          </DashboardWidget>

          {/* Prestasi Terbaru */}
          <DashboardWidget
            title="Prestasi Terbaru"
            description="Pencapaian dan penghargaan anggota UVICS."
            className="lg:col-span-6"
          >
            <DashboardEmptyState
              icon={Trophy}
              title="Belum ada prestasi terbaru."
              description="Pencapaian kompetisi dan prestasi anggota akan ditampilkan di sini."
            />
          </DashboardWidget>

          {/* Aktivitas Admin Terbaru */}
          <DashboardWidget
            title="Aktivitas Admin Terbaru"
            description="Log riwayat tindakan administrator sistem."
            className="lg:col-span-12"
          >
            <DashboardEmptyState
              icon={Activity}
              title="Belum ada aktivitas admin terbaru."
              description="Riwayat audit aktivitas admin akan terekam secara otomatis di sini."
            />
          </DashboardWidget>
        </div>
      </section>
    </div>
  );
}
