import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Event | UVICS Admin",
};

export default function AdminEventsPage() {
  return (
    <AdminModulePlaceholder
      title="Event"
      description="Kelola agenda kegiatan, workshop, dan seminar UVICS."
      icon={CalendarDays}
      message="Modul pengelolaan event akan tersedia pada tahap CMS berikutnya."
    />
  );
}
