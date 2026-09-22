import { Hero } from "@/components/sections/HeroSection";
import { AboutSection as About } from "@/components/sections/about/AboutSection";
import { GlanceSection } from "@/components/sections/GlanceSection";
import { FounderSection as Founder } from "@/components/sections/FounderSection";
import { ShowcaseSection as Showcase } from "@/components/sections/showcase/ShowcaseSection";
import { BlogSection as Blog } from "@/components/sections/BlogSection";
import { GallerySection as Gallery } from "@/components/sections/GallerySection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <About />
      <GlanceSection />
      <Showcase />
      <Blog />
      <Gallery />
      <Founder />
    </div>
  );
}
