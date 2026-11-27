import React, { type ComponentType } from "react";
import { Activity, AlertTriangle, Trophy, UserPlus } from "lucide-react";
import type {
  AuditActivityRow,
  RecentAchievementRow,
  RecentRegistrationRow,
} from "@/lib/backend/dashboard";
import { toFailure } from "@/lib/backend/errors";
import { formatDate, formatDateTime } from "@/lib/format/date";
import { DashboardEmptyState } from "./DashboardEmptyState";

interface ListItem {
  id: string;
  title: string;
  subtitle: string;
  /** Nilai atribut `dateTime` dan teks waktu yang ditampilkan. */
  time: { value: string; label: string };
}

interface DashboardListProps<T> {
  load: () => Promise<T[]>;
  toItem: (row: T) => ListItem;
  errorTitle: string;
  empty: {
    icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
    title: string;
    description: string;
  };
}

/** Isi widget daftar yang memuat datanya sendiri; gagal atau kosong hanya memengaruhi widget ini. */
async function DashboardList<T>({ load, toItem, errorTitle, empty }: DashboardListProps<T>) {
  const result = await load().then(
    (rows) => ({ rows }),
    (error: unknown) => ({ error: toFailure(error).error.message }),
  );

  if ("error" in result) {
    return (
      <div role="alert">
        <DashboardEmptyState icon={AlertTriangle} title={errorTitle} description={result.error} />
      </div>
    );
  }

  if (!result.rows.length) return <DashboardEmptyState {...empty} />;

  return (
    <ul className="-my-2 divide-y divide-gray-100">
      {result.rows.map(toItem).map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
            <p className="text-xs text-gray-500">{item.subtitle}</p>
          </div>
          <time dateTime={item.time.value} className="shrink-0 text-xs text-gray-400 tabular-nums">
            {item.time.label}
          </time>
        </li>
      ))}
    </ul>
  );
}

// Aksi yang ditulis migration saat ini; aksi baru tampil dengan kodenya sampai diberi label.
const ACTION_LABELS: Record<string, string> = {
  ADMIN_LOGIN: "Masuk ke dashboard admin",
  MEDIA_COMPLETED: "Mengunggah media",
  MEDIA_PUBLISHED: "Memublikasikan media",
  PAGE_PUBLISHED: "Menerbitkan halaman",
  PROGRAM_PUBLISHED: "Menerbitkan program",
  REGISTRATION_REVIEWED: "Meninjau pendaftaran",
  APPLICANT_CONVERTED: "Mengonversi pendaftar menjadi anggota",
  MEMBER_SOFT_DELETED: "Menghapus data anggota",
};

/** Aktivitas admin terbaru: aksi, admin, dan waktu WITA; payload audit tidak ditampilkan. */
export function DashboardAuditActivity({ load }: { load: () => Promise<AuditActivityRow[]> }) {
  return (
    <DashboardList
      load={load}
      errorTitle="Aktivitas admin gagal dimuat."
      empty={{
        icon: Activity,
        title: "Belum ada aktivitas admin terbaru.",
        description: "Riwayat audit aktivitas admin akan terekam secara otomatis di sini.",
      }}
      toItem={(row) => ({
        id: row.id,
        title: ACTION_LABELS[row.action] ?? row.action,
        subtitle: `oleh ${row.actor?.name ?? "Admin tidak dikenal"}`,
        time: { value: row.created_at, label: formatDateTime(row.created_at) },
      })}
    />
  );
}

const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Baru masuk",
  UNDER_REVIEW: "Sedang ditinjau",
  ACCEPTED: "Diterima",
  REJECTED: "Ditolak",
};

/** Lima pendaftaran terbaru: nama, status, dan waktu kirim. */
export function DashboardRecentRegistrations({
  load,
}: {
  load: () => Promise<RecentRegistrationRow[]>;
}) {
  return (
    <DashboardList
      load={load}
      errorTitle="Pendaftaran gagal dimuat."
      empty={{
        icon: UserPlus,
        title: "Belum ada pendaftaran terbaru.",
        description: "Pendaftaran baru akan muncul di sini ketika recruitment dibuka.",
      }}
      toItem={(row) => ({
        id: row.id,
        title: row.full_name,
        subtitle: REGISTRATION_STATUS_LABELS[row.status] ?? row.status,
        time: { value: row.submitted_at, label: formatDateTime(row.submitted_at) },
      })}
    />
  );
}

const PUBLICATION_LABELS: Record<RecentAchievementRow["publication_status"], string> = {
  DRAFT: "Draf",
  PUBLISHED: "Terbit",
  ARCHIVED: "Diarsipkan",
};

/** Lima prestasi terbaru: judul, peringkat, status publikasi, dan tanggal prestasi. */
export function DashboardRecentAchievements({
  load,
}: {
  load: () => Promise<RecentAchievementRow[]>;
}) {
  return (
    <DashboardList
      load={load}
      errorTitle="Prestasi gagal dimuat."
      empty={{
        icon: Trophy,
        title: "Belum ada prestasi terbaru.",
        description: "Pencapaian kompetisi dan prestasi anggota akan ditampilkan di sini.",
      }}
      toItem={(row) => ({
        id: row.id,
        title: row.title,
        subtitle: `${row.ranking} · ${PUBLICATION_LABELS[row.publication_status]}`,
        time: { value: row.achievement_date, label: formatDate(row.achievement_date) },
      })}
    />
  );
}
