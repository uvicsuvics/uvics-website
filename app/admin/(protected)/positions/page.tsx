import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Posisi | UVICS Admin",
};

export default function AdminPositionsPage() {
  return (
    <AdminModulePlaceholder
      title="Posisi"
      description="Kelola jabatan kepengurusan, wewenang, dan tanggung jawab peran dalam organisasi."
      icon={BadgeCheck}
      message="Modul pengelolaan posisi kepengurusan akan tersedia pada tahap integrasi berikutnya."
    />
  );
}
