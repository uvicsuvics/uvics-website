import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/sections/PagePlaceholder";

const description = "Jejaring alumni UVICS dan kiprah lulusan di industri.";

export const metadata: Metadata = { title: "Alumni | UVICS", description };

export default function AlumniPage() {
  return <PagePlaceholder title="Alumni" description={description} />;
}
