import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CmsNotice } from "@/components/admin/cms/CmsNotice";
import { CmsIndex } from "@/components/admin/cms/CmsIndex";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { CMS_NOTICES, noticeMessage } from "@/lib/admin/cms";
import { loadForAdmin } from "@/lib/admin/server";
import { listAdminPrograms } from "@/lib/backend/programs";
import { readEnum, readSearch, type SearchParams } from "@/lib/services/query";
import { CONTENT_STATUSES } from "@/types/cms";
import { archiveProgramAction, publishProgramAction } from "./actions";

export const metadata: Metadata = {
  title: "Program | UVICS Admin",
};

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const notice = noticeMessage(
    readEnum(params, "notice", CMS_NOTICES),
    "program",
  );
  const result = await loadForAdmin(listAdminPrograms);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Program"
        description="Program kerja UVICS. Urutan menentukan posisi di halaman Program; angka kecil tampil lebih dulu."
        actions={
          <Button href="/admin/programs/new" size="sm">
            <Plus aria-hidden="true" className="mr-1.5 size-4" />
            Tambah program
          </Button>
        }
      />
      <CmsNotice message={notice} />
      {result.ok ? (
        <CmsIndex
          noun="program"
          basePath="/admin/programs"
          rows={result.data.map((program) => ({
            id: program.id,
            title: program.name,
            slug: program.slug,
            status: program.status,
            updated_at: program.updated_at,
            order: program.display_order,
          }))}
          status={readEnum(params, "status", CONTENT_STATUSES)}
          search={readSearch(params)}
          publish={publishProgramAction}
          archive={archiveProgramAction}
        />
      ) : (
        <ErrorState
          title="Daftar program belum bisa dimuat"
          message={result.error.message}
        />
      )}
    </div>
  );
}
