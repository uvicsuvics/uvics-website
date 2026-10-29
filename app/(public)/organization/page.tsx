import type { Metadata } from "next";
import { OrganizationStructure } from "@/components/organization/OrganizationStructure";
import { PageHero } from "@/components/sections/PageHero";
import { ContentSection } from "@/components/sections/about/ContentSection";
import { Reveal } from "@/components/ui/Reveal";
import {
  getActivePeriod,
  getOrganizationPage,
  getOrganizationPeriods,
  getPeriodMembers,
} from "@/lib/services/organizationService";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getOrganizationPage();
  return { title: meta.title, description: meta.description };
}

export default async function OrganizationPage() {
  const [page, periods, activePeriod] = await Promise.all([
    getOrganizationPage(),
    getOrganizationPeriods(),
    getActivePeriod(),
  ]);
  const membersByPeriod = Object.fromEntries(
    await Promise.all(periods.map(async (period) => [period.id, await getPeriodMembers(period.id)] as const)),
  );

  return (
    <div className="flex flex-col">
      <PageHero hero={page.hero} />
      <ContentSection id="struktur" heading={page.structure}>
        <Reveal>
          <OrganizationStructure
            periods={periods}
            membersByPeriod={membersByPeriod}
            defaultPeriodId={activePeriod?.id ?? periods[0]?.id ?? ""}
            periodLabel={page.structure.periodLabel}
            emptyMessage={page.structure.emptyMessage}
          />
        </Reveal>
      </ContentSection>
    </div>
  );
}
