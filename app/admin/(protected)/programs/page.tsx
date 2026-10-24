import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Program | UVICS Admin",
};

export default function AdminProgramsPage() {
  return (
    <AdminModulePlaceholder
      title="Program"
      description="Kelola program kerja dan inisiatif kegiatan UVICS."
      icon={BookOpen}
      message="Modul pengelolaan program kerja akan tersedia pada tahap CMS berikutnya."
    />
  );
}
