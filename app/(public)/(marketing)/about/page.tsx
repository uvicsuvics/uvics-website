import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import {
  AboutActivitiesSection,
  AboutHistorySection,
  AboutOverviewSection,
  AboutVisionMissionSection,
  CultureValueSection,
} from "@/components/sections/about/AboutSections";
import { ClosingCtaSection } from "@/components/sections/about/ClosingCtaSection";
import { getAboutContent, getVisionMissionContent } from "@/lib/services/aboutService";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getAboutContent();
  return { title: meta.title, description: meta.description };
}

export default async function AboutPage() {
  const [about, visionMission] = await Promise.all([getAboutContent(), getVisionMissionContent()]);

  return (
    <div className="flex flex-col">
      <PageHero hero={about.hero} />
      <AboutOverviewSection overview={about.overview} />
      <AboutHistorySection history={about.history} />
      <AboutVisionMissionSection
        preview={about.visionMission}
        vision={visionMission.vision}
        mission={visionMission.mission}
      />
      <CultureValueSection content={about.values} muted />
      <AboutActivitiesSection activities={about.activities} />
      <ClosingCtaSection cta={about.cta} />
    </div>
  );
}
