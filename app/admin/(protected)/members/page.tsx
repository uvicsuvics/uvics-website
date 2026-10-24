import type { Metadata } from "next";
import { Users } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Anggota | UVICS Admin",
};

export default function AdminMembersPage() {
  return (
    <AdminModulePlaceholder
      title="Anggota"
      description="Kelola basis data anggota aktif, status keanggotaan, dan informasi kontak."
      icon={Users}
      message="Modul pengelolaan anggota aktif akan tersedia pada tahap integrasi berikutnya."
    />
  );
}
