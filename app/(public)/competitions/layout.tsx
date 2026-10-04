import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kompetisi & Kejuaraan Teknologi | UVICS UNKLAB",
  description:
    "Kurasi kompetisi teknologi bergengsi tingkat nasional dan internasional untuk mahasiswa Universitas Klabat dengan bimbingan mentor UVICS.",
};

export default function CompetitionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
