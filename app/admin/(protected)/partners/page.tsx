import type { Metadata } from "next";
import { Handshake } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Partner | UVICS Admin",
};

export default function AdminPartnersPage() {
  return (
    <AdminModulePlaceholder
      title="Partner"
      description="Kelola mitra industri, institusi akademik, dan partner kerja sama UVICS."
      icon={Handshake}
      message="Modul pengelolaan partner kerja sama akan tersedia pada tahap CMS berikutnya."
    />
  );
}
