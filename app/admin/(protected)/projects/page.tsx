import type { Metadata } from "next";
import { FolderGit2 } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Project | UVICS Admin",
};

export default function AdminProjectsPage() {
  return (
    <AdminModulePlaceholder
      title="Project"
      description="Kelola portofolio proyek dan karya kolaboratif komunitas UVICS."
      icon={FolderGit2}
      message="Modul pengelolaan proyek akan tersedia pada tahap CMS berikutnya."
    />
  );
}
