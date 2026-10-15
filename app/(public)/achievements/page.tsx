import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/sections/PagePlaceholder";

const description = "Capaian mahasiswa UVICS di kompetisi nasional dan internasional.";

export const metadata: Metadata = { title: "Prestasi | UVICS", description };

export default function AchievementsPage() {
  return <PagePlaceholder title="Prestasi" description={description} />;
}
