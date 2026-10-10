import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Alumni | UVICS Admin",
};

export default function AdminAlumniPage() {
  return (
    <AdminModulePlaceholder
      title="Alumni"
      description="Kelola direktori lulusan UVICS, riwayat kiprah, dan jejaring alumni."
      icon={GraduationCap}
      message="Modul pengelolaan direktori alumni akan tersedia pada tahap integrasi berikutnya."
    />
  );
}
