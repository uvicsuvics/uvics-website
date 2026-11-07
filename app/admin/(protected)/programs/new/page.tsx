import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BackLink } from "@/components/admin/cms/BackLink";
import { ProgramForm } from "@/components/admin/cms/ProgramForm";

export const metadata: Metadata = {
  title: "Tambah Program | UVICS Admin",
};

export default async function NewProgramPage() {
  return (
    <div className="space-y-6">
      <BackLink href="/admin/programs">Daftar program</BackLink>
      <AdminPageHeader title="Tambah program" />
      <ProgramForm />
    </div>
  );
}
