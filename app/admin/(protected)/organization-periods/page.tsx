import type { Metadata } from "next";
import { CalendarRange } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Periode Organisasi | UVICS Admin",
};

export default function AdminOrganizationPeriodsPage() {
  return (
    <AdminModulePlaceholder
      title="Periode Organisasi"
      description="Kelola masa bakti kepengurusan, arsip periode kepemimpinan, dan riwayat organisasi."
      icon={CalendarRange}
      message="Modul pengelolaan periode organisasi akan tersedia pada tahap integrasi berikutnya."
    />
  );
}
