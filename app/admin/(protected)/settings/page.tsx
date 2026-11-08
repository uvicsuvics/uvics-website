import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsForm } from "@/components/admin/cms/SettingsForm";
import { ErrorState } from "@/components/ui/ErrorState";
import { loadForAdmin } from "@/lib/admin/server";
import { settingsToForm } from "@/lib/admin/settings";
import { listAdminSettings } from "@/lib/backend/settings";

export const metadata: Metadata = {
  title: "Pengaturan Website | UVICS Admin",
};

export default async function AdminSettingsPage() {
  const result = await loadForAdmin(listAdminSettings);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pengaturan Website"
        description="Saat ini website baru memakai status pendaftaran. Pengaturan lain disimpan untuk bagian website yang menyusul."
      />
      {result.ok ? (
        <SettingsForm initial={settingsToForm(result.data)} />
      ) : (
        <ErrorState
          title="Pengaturan belum bisa dimuat"
          message={result.error.message}
        />
      )}
    </div>
  );
}
