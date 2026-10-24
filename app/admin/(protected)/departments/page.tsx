import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Departemen | UVICS Admin",
};

export default function AdminDepartmentsPage() {
  return (
    <AdminModulePlaceholder
      title="Departemen"
      description="Kelola bagan struktur departemen, divisi kerja, dan deskripsi unit UVICS."
      icon={Building2}
      message="Modul pengelolaan departemen akan tersedia pada tahap integrasi berikutnya."
    />
  );
}
