import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/sections/PagePlaceholder";

const description = "Informasi pendaftaran anggota baru UVICS.";

export const metadata: Metadata = { title: "Join UVICS", description };

export default function JoinPage() {
  return <PagePlaceholder title="Join UVICS" description={description} />;
}
