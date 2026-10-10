import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Pengaturan Website | UVICS Admin",
};

export default function AdminSettingsPage() {
  return (
    <AdminModulePlaceholder
      title="Pengaturan Website"
      description="Kelola konfigurasi umum website, informasi kontak, dan preferensi platform."
      icon={Settings}
      message="Modul pengaturan website akan tersedia pada tahap integrasi berikutnya."
    />
  );
}
