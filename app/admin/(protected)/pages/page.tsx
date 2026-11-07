import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CmsBanner } from "@/components/admin/cms/CmsBanner";
import { CmsIndex } from "@/components/admin/cms/CmsIndex";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { CMS_NOTICES, noticeMessage } from "@/lib/admin/cms";
import { loadForAdmin } from "@/lib/admin/server";
import { listAdminPages } from "@/lib/backend/pages";
import { readEnum, readSearch, type SearchParams } from "@/lib/services/query";
import { CONTENT_STATUSES } from "@/types/cms";
import { archivePageAction, publishPageAction } from "./actions";

export const metadata: Metadata = {
  title: "Halaman | UVICS Admin",
};

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const notice = noticeMessage(
    readEnum(params, "notice", CMS_NOTICES),
    "halaman",
  );
  const result = await loadForAdmin(listAdminPages);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Halaman"
        description="Kelola halaman statis website UVICS. Halaman berstatus Terbit langsung tampil di website."
        actions={
          <Button href="/admin/pages/new" size="sm">
            <Plus aria-hidden="true" className="mr-1.5 size-4" />
            Tambah halaman
          </Button>
        }
      />
      {notice ? <CmsBanner tone="success">{notice}</CmsBanner> : null}
      {result.ok ? (
        <CmsIndex
          noun="halaman"
          basePath="/admin/pages"
          rows={result.data}
          status={readEnum(params, "status", CONTENT_STATUSES)}
          search={readSearch(params)}
          publish={publishPageAction}
          archive={archivePageAction}
        />
      ) : (
        <ErrorState
          title="Daftar halaman belum bisa dimuat"
          message={result.error.message}
        />
      )}
    </div>
  );
}
