import { CheckCircle2, Cpu, GraduationCap, Network, Scale, Target, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ContentSection } from "@/components/sections/about/ContentSection";
import type { MissionItem, VisionMissionContent } from "@/data/mock/about";

const MISSION_ICONS: Record<MissionItem["iconName"], LucideIcon> = { Target, Cpu, GraduationCap, Scale, Network };

/** Pernyataan visi, penjelasannya, dan pilar pendukung. */
export function VisionSection({ vision }: { vision: VisionMissionContent["vision"] }) {
  return (
    <ContentSection id="visi" heading={vision}>
      <Reveal className="flex flex-col gap-8 p-6 bg-white rounded-2xl border border-gray-200 sm:p-12">
        <blockquote className="pl-6 font-[family-name:var(--font-heading)] text-2xl font-semibold leading-snug text-gray-900 border-l-4 border-accent sm:text-3xl">
          {vision.statement}
        </blockquote>
        <div className="grid gap-6 md:grid-cols-2">
          {vision.elaboration.map((paragraph) => (
            <p key={paragraph} className="leading-relaxed text-gray-600">
              {paragraph}
            </p>
          ))}
        </div>
      </Reveal>
      <Reveal>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {vision.pillars.map((pillar) => (
            <li key={pillar.title} className="flex flex-col gap-2 p-5 bg-primary-50 rounded-xl">
              <h3 className="font-heading text-lg font-bold text-primary-900">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-gray-700">{pillar.description}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </ContentSection>
  );
}

/** Daftar misi bernomor beserta langkah konkretnya. */
export function MissionSection({ mission }: { mission: VisionMissionContent["mission"] }) {
  return (
    <ContentSection id="misi" heading={mission} muted>
      <Reveal>
        <ol className="flex flex-col gap-5">
          {mission.items.map((item) => {
            const Icon = MISSION_ICONS[item.iconName];
            return (
              <li
                key={item.number}
                className="flex flex-col gap-5 p-6 bg-white rounded-2xl border border-gray-200 sm:flex-row sm:p-8"
              >
                <div className="flex shrink-0 items-center gap-3 sm:flex-col" aria-hidden="true">
                  <span className="font-mono text-3xl font-bold text-primary-300">{item.number}</span>
                  <span className="flex items-center justify-center w-11 h-11 text-primary bg-primary-50 rounded-xl">
                    <Icon className="w-5 h-5" />
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="font-heading text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="leading-relaxed text-gray-600">{item.description}</p>
                  <ul className="grid gap-2 pt-1 md:grid-cols-2">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="shrink-0 mt-0.5 w-4 h-4 text-primary" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
      </Reveal>
    </ContentSection>
  );
}

/** Prinsip yang menopang program UVICS. */
export function PrinciplesSection({ principles }: { principles: VisionMissionContent["principles"] }) {
  return (
    <ContentSection id="prinsip" heading={principles}>
      <Reveal>
        <ul className="grid gap-5 md:grid-cols-3">
          {principles.items.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 p-6 bg-white rounded-2xl border border-gray-200">
              <h3 className="font-heading text-xl font-bold text-gray-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{item.description}</p>
              <blockquote className="mt-auto pt-4 text-sm font-medium italic text-primary border-t border-gray-100">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
            </li>
          ))}
        </ul>
      </Reveal>
    </ContentSection>
  );
}
