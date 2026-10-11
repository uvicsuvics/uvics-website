import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/sections/PagePlaceholder";

const description = "Direktori mahasiswa dan anggota aktif UVICS.";

export const metadata: Metadata = { title: "Member | UVICS", description };

export default function MembersPage() {
  return <PagePlaceholder title="Member" description={description} />;
}
