import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/sections/PagePlaceholder";

const description = "Agenda seminar, workshop, dan kegiatan teknologi UVICS.";

export const metadata: Metadata = { title: "Event | UVICS", description };

export default function EventsPage() {
  return <PagePlaceholder title="Event" description={description} message="Belum ada event mendatang." />;
}
