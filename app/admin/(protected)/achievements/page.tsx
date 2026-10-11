import type { Metadata } from "next";
import { Award } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Prestasi | UVICS Admin",
};

export default function AdminAchievementsPage() {
  return (
    <AdminModulePlaceholder
      title="Prestasi"
      description="Kelola pencapaian, kejuaraan, dan rekam jejak prestasi mahasiswa UVICS."
      icon={Award}
      message="Modul pengelolaan prestasi akan tersedia pada tahap CMS berikutnya."
    />
  );
}
