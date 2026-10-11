import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";

export const metadata: Metadata = {
  title: "Log Audit | UVICS Admin",
};

export default function AdminAuditLogsPage() {
  return (
    <AdminModulePlaceholder
      title="Log Audit"
      description="Pantau riwayat aktivitas operasional administrator dan log keamanan sistem."
      icon={ShieldCheck}
      message="Modul penelusuran log audit akan tersedia pada tahap integrasi berikutnya."
    />
  );
}
