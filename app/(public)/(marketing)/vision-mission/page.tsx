import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { CultureValueSection } from "@/components/sections/about/AboutSections";
import { ClosingCtaSection } from "@/components/sections/about/ClosingCtaSection";
import { MissionSection, VisionSection } from "@/components/sections/about/VisionMissionSections";
import { getVisionMissionContent } from "@/lib/services/aboutService";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getVisionMissionContent();
  return { title: meta.title, description: meta.description };
}

export default async function VisionMissionPage() {
  const content = await getVisionMissionContent();

  return (
    <div className="flex flex-col">
      <PageHero hero={content.hero} />
      <VisionSection vision={content.vision} />
      <MissionSection mission={content.mission} />
      <CultureValueSection content={content.principles} />
      <ClosingCtaSection cta={content.cta} />
    </div>
  );
}
