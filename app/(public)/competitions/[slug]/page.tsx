import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CompetitionDetailHeader } from "@/components/competitions/CompetitionDetailHeader";
import { CompetitionDetailContent } from "@/components/competitions/CompetitionDetailContent";
import { RelatedCompetitions } from "@/components/competitions/RelatedCompetitions";
import { getCompetitionBySlug, getRelatedCompetitions } from "@/lib/services/competitionService";

interface CompetitionDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CompetitionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const competition = await getCompetitionBySlug(slug);

  if (!competition) {
    return {
      title: "Kompetisi Tidak Ditemukan | UVICS UNKLAB",
      description: "Informasi kompetisi yang Anda cari tidak tersedia di UVICS.",
    };
  }

  return {
    title: `${competition.title} | Kompetisi UVICS UNKLAB`,
    description: competition.description,
  };
}

export default async function CompetitionDetailPage({
  params,
}: CompetitionDetailPageProps) {
  const { slug } = await params;
  const competition = await getCompetitionBySlug(slug);

  if (!competition) {
    notFound();
  }

  const related = await getRelatedCompetitions(slug);

  return (
    <div>
      <CompetitionDetailHeader competition={competition} />
      <CompetitionDetailContent competition={competition} />
      <RelatedCompetitions competitions={related} />
    </div>
  );
}
