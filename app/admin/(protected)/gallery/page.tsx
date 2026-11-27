import type { Metadata } from "next";
import { Image as ImageIcon } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Galeri | UVICS Admin",
};

export default function AdminGalleryPage() {
  return (
    <AdminModulePlaceholder
      title="Galeri"
      description="Kelola dokumentasi visual, album foto, dan arsip kegiatan UVICS."
      icon={ImageIcon}
      message="Modul pengelolaan galeri foto akan tersedia pada tahap CMS berikutnya."
    />
  );
}
