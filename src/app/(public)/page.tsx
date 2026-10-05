import { Hero } from "@/src/components/sections/HeroSection";
import { AboutSection as About } from "@/src/components/sections/AboutSection";
import { GlanceSection } from "@/src/components/sections/GlanceSection";
import { DepartmentsSection } from "@/src/components/sections/DepartmentsSection";
import { ProgramsSection } from "@/src/components/sections/ProgramsSection";
import { CompetitionsSection } from "@/src/components/sections/CompetitionsSection";
import { EventsSection } from "@/src/components/sections/EventsSection";
import { ProjectsSection } from "@/src/components/sections/ProjectsSection";
import { AchievementsSection } from "@/src/components/sections/AchievementsSection";
import { NewsSection } from "@/src/components/sections/NewsSection";
import { OrganizationPreviewSection } from "@/src/components/sections/OrganizationPreviewSection";
import { PartnersSection } from "@/src/components/sections/PartnersSection";
import { GallerySection } from "@/src/components/sections/GallerySection";
import { JoinCTASection } from "@/src/components/sections/JoinCTASection";

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

      {/* Galeri Interaktif Organisasi */}
      <GallerySection />

      {/* Seksi 13: Join UVICS Final CTA */}
      <JoinCTASection />
    </div>
  );
}
