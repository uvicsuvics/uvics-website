import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ClosingCtaSection } from "@/components/sections/about/ClosingCtaSection";
import { getProgramBySlug, getPrograms, getProgramsPage } from "@/lib/services/programService";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getPrograms()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const program = await getProgramBySlug((await params).slug);
  if (!program) {
    return { title: "Program Tidak Ditemukan | UVICS" };
  }
  return { title: `${program.title} | Program UVICS`, description: program.description };
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const [program, page] = await Promise.all([getProgramBySlug((await params).slug), getProgramsPage()]);
  if (!program) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      <PageHero
        hero={{
          title: page.hero.title,
          titleHighlight: program.title,
          description: program.description,
          image: { src: program.image, alt: program.title },
        }}
      />
      <ClosingCtaSection cta={page.detail.cta} />
    </div>
  );
}
