import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/sections/PagePlaceholder";

const description = "Dokumentasi visual kegiatan dan momen komunitas UVICS.";

export const metadata: Metadata = { title: "Galeri | UVICS", description };

export default function GalleryPage() {
  return <PagePlaceholder title="Galeri" description={description} />;
}
