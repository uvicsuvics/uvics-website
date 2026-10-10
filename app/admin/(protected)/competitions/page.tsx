import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Kompetisi | UVICS Admin",
};

export default function AdminCompetitionsPage() {
  return (
    <AdminModulePlaceholder
      title="Kompetisi"
      description="Kelola informasi perlombaan, hackathon, dan kompetisi eksternal."
      icon={Trophy}
      message="Modul pengelolaan kompetisi akan tersedia pada tahap CMS berikutnya."
    />
  );
}
