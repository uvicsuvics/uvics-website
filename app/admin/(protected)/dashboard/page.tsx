import React, { Suspense } from "react";
import {
  Users,
  GraduationCap,
  UserPlus,
  Newspaper,
  CalendarDays,
  Trophy,
} from "lucide-react";
import { requirePageAdmin } from "@/lib/auth/page";
import { serverClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DashboardKpiCard, type DashboardKpiCardProps } from "@/components/admin/dashboard/DashboardKpiCard";
import {
  DashboardAuditActivity,
  DashboardRecentAchievements,
  DashboardRecentRegistrations,
} from "@/components/admin/dashboard/DashboardRecentLists";
import {
  DashboardStatCardSkeleton,
  DashboardWidgetBodySkeleton,
} from "@/components/admin/dashboard/DashboardSkeleton";
import { DashboardStatCard } from "@/components/admin/dashboard/DashboardStatCard";
import { DashboardWidget } from "@/components/admin/dashboard/DashboardWidget";
import { DashboardEmptyState } from "@/components/admin/dashboard/DashboardEmptyState";
import {
  countMembers,
  countOpenCompetitions,
  countPendingRegistrations,
  listRecentAchievements,
  listRecentAuditActivity,
  listRecentRegistrations,
} from "@/lib/backend/dashboard";

export const metadata = { title: "Dashboard Admin | UVICS" };

/** KPI tanpa `load` belum punya tabel sumber dan tampil "Belum tersedia", bukan 0. */
type Stat = Omit<DashboardKpiCardProps, "load"> & Partial<Pick<DashboardKpiCardProps, "load">>;

export default async function DashboardPage() {
  const admin = await requirePageAdmin();
  const client = await serverClient();

  const stats: Stat[] = [
    {
      title: "Anggota Aktif",
      description: "Total anggota aktif",
      icon: Users,
      iconColorVariant: "primary",
      load: () => countMembers(client, "ACTIVE"),
    },
    {
      title: "Alumni",
      description: "Lulusan terdata",
      icon: GraduationCap,
      iconColorVariant: "accent",
      load: () => countMembers(client, "ALUMNI"),
    },
    {
      title: "Pendaftaran Menunggu",
      description: "Baru masuk atau sedang ditinjau",
      icon: UserPlus,
      iconColorVariant: "warning",
      load: () => countPendingRegistrations(client),
    },
    {
      title: "Berita Terbit",
      description: "Modul berita belum dibangun",
      icon: Newspaper,
      iconColorVariant: "primary",
    },
    {
      title: "Event Mendatang",
      description: "Modul event belum dibangun",
      icon: CalendarDays,
      iconColorVariant: "accent",
    },
    {
      title: "Kompetisi Dibuka",
      description: "Terbit dan pendaftaran dibuka",
      icon: Trophy,
      iconColorVariant: "warning",
      load: () => countOpenCompetitions(client),
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

      {/* 2. KPI Summary Cards (Compact 3x2 Grid), masing-masing dimuat sendiri */}
      <section aria-labelledby="kpi-summary-title">
        <h2 id="kpi-summary-title" className="sr-only">
          Ringkasan Indikator Kinerja
        </h2>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {stats.map(({ load, ...stat }) =>
            load ? (
              <Suspense key={stat.title} fallback={<DashboardStatCardSkeleton />}>
                <DashboardKpiCard {...stat} load={load} />
              </Suspense>
            ) : (
              <DashboardStatCard key={stat.title} {...stat} value={null} />
            ),
          )}
        </div>
      </section>

      {/* 3. Dashboard Main Grid (Operational Widgets) */}
      <section aria-labelledby="overview-widgets-title" className="pt-1">
        <h2 id="overview-widgets-title" className="sr-only">
          Widget Ikhtisar Operasional
        </h2>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <DashboardWidget
            title="Pendaftaran Terbaru"
            description="Pendaftaran anggota terbaru yang masuk."
            className="lg:col-span-7"
          >
            <Suspense fallback={<DashboardWidgetBodySkeleton />}>
              <DashboardRecentRegistrations load={() => listRecentRegistrations(client)} />
            </Suspense>
          </DashboardWidget>

          <DashboardWidget
            title="Event Mendatang"
            description="Agenda dan kegiatan UVICS yang akan datang."
            className="lg:col-span-5"
          >
            <DashboardEmptyState
              icon={CalendarDays}
              title="Modul event belum tersedia."
              description="Event akan muncul di sini setelah modul event dibangun."
            />
          </DashboardWidget>

          <DashboardWidget
            title="Berita Terbaru"
            description="Publikasi artikel dan pengumuman terbaru."
            className="lg:col-span-6"
          >
            <DashboardEmptyState
              icon={Newspaper}
              title="Modul berita belum tersedia."
              description="Berita akan muncul di sini setelah modul berita dibangun."
            />
          </DashboardWidget>

          <DashboardWidget
            title="Prestasi Terbaru"
            description="Pencapaian dan penghargaan anggota UVICS."
            className="lg:col-span-6"
          >
            <Suspense fallback={<DashboardWidgetBodySkeleton />}>
              <DashboardRecentAchievements load={() => listRecentAchievements(client)} />
            </Suspense>
          </DashboardWidget>

          <DashboardWidget
            title="Aktivitas Admin Terbaru"
            description="Log riwayat tindakan administrator sistem."
            className="lg:col-span-12"
          >
            <Suspense fallback={<DashboardWidgetBodySkeleton />}>
              <DashboardAuditActivity load={() => listRecentAuditActivity(client)} />
            </Suspense>
          </DashboardWidget>
        </div>
      </section>
    </div>
  );
}
