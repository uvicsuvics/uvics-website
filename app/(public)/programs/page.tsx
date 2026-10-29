import type { Metadata } from "next";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { PageHero } from "@/components/sections/PageHero";
import { ClosingCtaSection } from "@/components/sections/about/ClosingCtaSection";
import { ContentSection } from "@/components/sections/about/ContentSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { getPrograms, getProgramsPage } from "@/lib/services/programService";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getProgramsPage();
  return { title: meta.title, description: meta.description };
}

export default async function ProgramsPage() {
  const [page, programs] = await Promise.all([getProgramsPage(), getPrograms()]);

  return (
    <div className="flex flex-col">
      <PageHero hero={page.hero} />
      <ContentSection id="program" heading={page.list}>
        <Reveal>
          {programs.length === 0 ? (
            <EmptyState message={page.list.emptyMessage} />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map((program) => (
                <li key={program.id}>
                  <ProgramCard program={program} linkLabel={page.list.linkLabel} />
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </ContentSection>
      <ClosingCtaSection cta={page.cta} />
    </div>
  );
}
