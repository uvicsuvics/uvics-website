import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BackLink } from "@/components/admin/cms/BackLink";
import { PageForm } from "@/components/admin/cms/PageForm";

export const metadata: Metadata = {
  title: "Tambah Halaman | UVICS Admin",
};

export default async function NewPagePage() {
  return (
    <div className="space-y-6">
      <BackLink href="/admin/pages">Daftar halaman</BackLink>
      <AdminPageHeader title="Tambah halaman" />
      <PageForm />
    </div>
  );
}
