import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Halaman | UVICS Admin",
};

export default function AdminPagesPage() {
  return (
    <AdminModulePlaceholder
      title="Halaman"
      description="Kelola halaman statis dan struktur konten publik website UVICS."
      icon={FileText}
      message="Modul pengelolaan halaman statis akan tersedia pada tahap CMS berikutnya."
    />
  );
}
