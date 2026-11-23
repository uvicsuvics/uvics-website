import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicDepartment } from "@/lib/services/departmentService";

interface DepartmentIndexItemProps {
  department: PublicDepartment;
  /** Nomor urut tampilan, mulai dari 1. */
  number: number;
  /** Nama koordinator periode aktif, bila ada. */
  coordinator?: string;
  /** Jumlah pengurus departemen pada periode aktif. */
  memberCount: number;
  labels: { coordinatorLabel: string; linkLabel: string; membersSuffix: string };
}

/**
 * Baris indeks departemen: nomor, nama, deskripsi, koordinator, jumlah pengurus, dan tautan detail.
 * Tautan panah menutupi seluruh baris supaya baris bisa diklik di mana saja.
 */
export function DepartmentIndexItem({ department, number, coordinator, memberCount, labels }: DepartmentIndexItemProps) {
  return (
    <li className="group relative grid grid-cols-[2.75rem_minmax(0,1fr)_auto] gap-x-4 gap-y-5 py-8 border-b border-gray-200 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:gap-x-6 lg:grid-cols-[5rem_minmax(0,1fr)_14rem_auto] lg:items-center lg:gap-x-10 lg:py-10">
      {/* font-heading belum terdaftar di @theme, jadi hanya berlaku lewat aturan dasar h1-h6. */}
      <span
        aria-hidden="true"
        className="font-(family-name:--font-heading) text-3xl font-semibold leading-none text-primary-300 lg:text-4xl"
      >
        {String(number).padStart(2, "0")}
      </span>

      <div className="flex flex-col gap-2 min-w-0">
        <h3 className="font-heading text-2xl font-bold leading-tight text-primary-900 transition-colors group-hover:text-primary sm:text-3xl">
          {department.name}
        </h3>
        <p className="max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">{department.description}</p>
      </div>

      {(coordinator || memberCount > 0) && (
        <p className="flex flex-col col-start-2 text-sm lg:col-start-3 lg:row-start-1">
          {coordinator && (
            <>
              <span className="text-xs text-gray-600">{labels.coordinatorLabel}</span>
              <span className="font-semibold text-gray-900">{coordinator}</span>
            </>
          )}
          {memberCount > 0 && <span className="text-gray-600">{`${memberCount} ${labels.membersSuffix}`}</span>}
        </p>
      )}

      <Link
        href={`/departments/${department.slug}`}
        aria-label={`${labels.linkLabel} ${department.name}`}
        className="flex items-center justify-center col-start-3 row-start-1 w-12 h-12 text-primary rounded-full border border-primary-100 transition-colors after:absolute after:inset-0 group-hover:text-white group-hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary lg:col-start-4"
      >
        <ArrowRight
          className="w-5 h-5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}
