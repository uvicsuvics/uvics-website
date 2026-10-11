import type { Metadata } from "next";
import { UserCheck } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Pendaftaran | UVICS Admin",
};

export default function AdminRegistrationsPage() {
  return (
    <AdminModulePlaceholder
      title="Pendaftaran"
      description="Kelola pengajuan pendaftaran anggota baru dan alur seleksi UVICS."
      icon={UserCheck}
      message="Modul pengelolaan pendaftaran akan tersedia pada tahap integrasi berikutnya."
    />
  );
}
