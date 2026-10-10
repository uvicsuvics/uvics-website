import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kompetisi & Kejuaraan | UVICS UNKLAB",
  description:
    "Kurasi kompetisi dan kejuaraan bergengsi tingkat nasional hingga internasional untuk mahasiswa Universitas Klabat dengan bimbingan mentor UVICS.",
};

export default function CompetitionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
