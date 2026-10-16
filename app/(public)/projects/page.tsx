import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/sections/PagePlaceholder";

const description = "Karya dan proyek teknologi yang dibangun anggota UVICS.";

export const metadata: Metadata = { title: "Project | UVICS", description };

export default function ProjectsPage() {
  return <PagePlaceholder title="Project" description={description} message="Belum ada project yang tersedia." />;
}
