import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/sections/PagePlaceholder";

const description = "Bagan pimpinan dan kepengurusan organisasi UVICS.";

export const metadata: Metadata = { title: "Struktur Organisasi | UVICS", description };

export default function OrganizationPage() {
  return <PagePlaceholder title="Struktur Organisasi" description={description} />;
}
