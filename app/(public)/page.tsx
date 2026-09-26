import { Hero } from "@/components/sections/HeroSection";
import { AboutSection as About } from "@/components/sections/about/AboutSection";
import { GlanceSection } from "@/components/sections/GlanceSection";
import { DepartmentsSection } from "@/components/sections/DepartmentsSection";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { CompetitionsSection } from "@/components/sections/CompetitionsSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { NewsSection } from "@/components/sections/NewsSection";
import { OrganizationPreviewSection } from "@/components/sections/OrganizationPreviewSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { JoinCTASection } from "@/components/sections/JoinCTASection";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Seksi 01: Hero Section */}
      <Hero />

      {/* Seksi 02: About UVICS Preview */}
      <About />

      {/* Seksi 03: UVICS at a Glance */}
      <GlanceSection />

      {/* Seksi 04: Departments Preview */}
      <DepartmentsSection />

      {/* Seksi 05: Programs / What We Do */}
      <ProgramsSection />

      {/* Seksi 06: Featured Competitions */}
      <CompetitionsSection />

      {/* Seksi 07: Upcoming Events */}
      <EventsSection />

      {/* Seksi 08: Featured Projects */}
      <ProjectsSection />

      {/* Seksi 09: Latest Achievements */}
      <AchievementsSection />

      {/* Seksi 10: Latest News */}
      <NewsSection />

      {/* Seksi 11: Current Organization Preview */}
      <OrganizationPreviewSection />

      {/* Seksi 12: Partners & Collaborator Network */}
      <PartnersSection />

      {/* Seksi 13: Join UVICS Final CTA */}
      <JoinCTASection />
    </div>
  );
}
