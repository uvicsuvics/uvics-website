import { Reveal } from "@/components/ui/Reveal";
import { ContentSection } from "@/components/sections/about/ContentSection";
import type { VisionMissionContent } from "@/data/mock/about";

const toNumber = (index: number) => String(index + 1).padStart(2, "0");

/** Empat butir visi resmi, apa adanya. */
export function VisionSection({ vision }: { vision: VisionMissionContent["vision"] }) {
  return (
    <ContentSection id="visi" heading={vision}>
      <Reveal>
        <ol className="grid gap-4 sm:grid-cols-2">
          {vision.items.map((item, index) => (
            <li key={item} className="flex flex-col gap-3 p-6 bg-primary-50 rounded-2xl sm:p-8">
              <span className="font-mono text-2xl font-bold text-primary-300" aria-hidden="true">
                {toNumber(index)}
              </span>
              <p className="font-heading text-xl font-semibold leading-snug text-primary-900">{item}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </ContentSection>
  );
}

/** Empat butir misi resmi, bernomor dan apa adanya. */
export function MissionSection({ mission }: { mission: VisionMissionContent["mission"] }) {
  return (
    <ContentSection id="misi" heading={mission} muted>
      <Reveal>
        <ol className="flex flex-col gap-4">
          {mission.items.map((item, index) => (
            <li
              key={item}
              className="flex items-start gap-5 p-6 bg-white rounded-2xl border border-gray-200 sm:p-8"
            >
              <span className="shrink-0 font-mono text-3xl font-bold text-primary-300" aria-hidden="true">
                {toNumber(index)}
              </span>
              <p className="pt-1 text-lg leading-relaxed text-gray-800">{item}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </ContentSection>
  );
}
