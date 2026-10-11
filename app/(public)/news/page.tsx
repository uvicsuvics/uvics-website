import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/sections/PagePlaceholder";

const description = "Kabar terbaru, siaran pers, dan pengumuman UVICS.";

export const metadata: Metadata = { title: "Berita | UVICS", description };

export default function NewsPage() {
  return <PagePlaceholder title="Berita" description={description} message="Belum ada berita yang dipublikasikan." />;
}
