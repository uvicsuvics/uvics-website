import { notFound } from 'next/navigation';
import { CompetitionDetailHeader } from '@/components/competitions/CompetitionDetailHeader';
import { CompetitionDetailContent } from '@/components/competitions/CompetitionDetailContent';
import { RelatedCompetitions } from '@/components/competitions/RelatedCompetitions';
import { MOCK_COMPETITIONS } from '@/lib/mock-data/competitions';

interface CompetitionDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompetitionDetailPage({ params }: CompetitionDetailPageProps) {
  const { slug } = await params;
  const competition = MOCK_COMPETITIONS.find((item) => item.slug === slug);

  if (!competition) {
    notFound();
  }

  const related = MOCK_COMPETITIONS.filter(
    (item) =>
      item.id !== competition.id &&
      (item.category === competition.category || item.level === competition.level)
  ).slice(0, 3);

  return (
    <div>
      <CompetitionDetailHeader competition={competition} />
      <CompetitionDetailContent competition={competition} />
      <RelatedCompetitions competitions={related} />
    </div>
  );
}
