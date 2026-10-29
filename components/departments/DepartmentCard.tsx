import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Code2,
  Megaphone,
  Palette,
  ShieldCheck,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { PublicDepartment } from "@/lib/services/departmentService";

// Tabel departments tidak punya kolom ikon, jadi ikon dipetakan dari slug di sisi tampilan.
const DEPARTMENT_ICONS: Record<string, LucideIcon> = {
  "software-engineering": Code2,
  "artificial-intelligence": BrainCircuit,
  "ui-ux-design": Palette,
  "competitive-programming": Trophy,
  "cybersecurity-cloud": ShieldCheck,
  "public-relations": Megaphone,
};

interface DepartmentCardProps {
  department: PublicDepartment;
  /** Nama koordinator periode aktif, bila ada. */
  coordinator?: string;
  coordinatorLabel: string;
  linkLabel: string;
}

/**
 * Kartu departemen untuk listing: ikon, nama, deskripsi, koordinator, dan tautan detail.
 */
export function DepartmentCard({ department, coordinator, coordinatorLabel, linkLabel }: DepartmentCardProps) {
  const Icon = DEPARTMENT_ICONS[department.slug] ?? Users;

  return (
    <article className="flex flex-col gap-4 h-full p-6 bg-white rounded-xl border border-gray-200 sm:p-8">
      <span className="flex items-center justify-center w-11 h-11 text-primary bg-primary-50 rounded-xl">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </span>
      <h3 className="font-heading text-xl font-bold text-gray-900">{department.name}</h3>
      <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">{department.description}</p>
      <div className="flex flex-wrap items-end justify-between gap-3 mt-auto pt-4 text-sm border-t border-gray-100">
        {coordinator && (
          <p>
            <span className="block text-gray-500">{coordinatorLabel}</span>
            <span className="font-medium text-gray-900">{coordinator}</span>
          </p>
        )}
        <Link
          href={`/departments/${department.slug}`}
          className="group inline-flex items-center gap-1.5 font-semibold text-primary rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {linkLabel}
          <span className="sr-only"> {department.name}</span>
          <ArrowRight
            className="w-4 h-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
