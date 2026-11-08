import { ArrowRight } from "lucide-react";
import { DepartmentCard } from "@/components/departments/DepartmentCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import type { PublicDepartment } from "@/lib/services/departmentService";

export interface DepartmentsSectionProps {
  departments: PublicDepartment[];
}

/**
 * Seksi 4: Departments Preview (Homepage). Kartu sama dengan halaman /departments.
 */
export function DepartmentsSection({ departments }: DepartmentsSectionProps) {
  return (
    <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      <Reveal className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
          Departemen UVICS
        </h2>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          Setiap departemen menjalankan program kerja yang membantu anggota bertumbuh dan berprestasi
          bersama.
        </p>
      </Reveal>

      <Reveal>
        {departments.length === 0 ? (
          <EmptyState message="Belum ada data departemen yang tersedia saat ini." />
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department) => (
              <li key={department.id}>
                <DepartmentCard department={department} linkLabel="Lihat departemen" />
              </li>
            ))}
          </ul>
        )}
      </Reveal>

      <Reveal className="mt-16 p-8 rounded-3xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <h3 className="text-base font-bold text-gray-900">Ingin tahu pengurus setiap departemen?</h3>
          <p className="text-sm text-gray-600">Lihat deskripsi, program, dan pengurus tiap departemen.</p>
        </div>
        <Button variant="primary" size="md" href="/departments">
          <span>Kunjungi Halaman Departemen</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Reveal>
    </section>
  );
}
