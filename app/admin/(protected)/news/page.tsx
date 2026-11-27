import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Berita | UVICS Admin",
};

export default function AdminNewsPage() {
  return (
    <AdminModulePlaceholder
      title="Berita"
      description="Kelola artikel berita, pengumuman, dan publikasi UVICS."
      icon={Newspaper}
      message="Modul pengelolaan berita akan tersedia pada tahap CMS berikutnya."
    />
  );
}
