import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, Target } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { ContentSection } from "@/components/sections/about/ContentSection";
import type { AboutContent, CtaLink, CultureValueContent, VisionMissionContent } from "@/data/mock/about";

const PILL = "px-4 py-2 text-sm font-semibold rounded-full";

function ArrowLink({ link }: { link: CtaLink }) {
  return (
    <Link
      href={link.href}
      className="group inline-flex items-center gap-2 font-semibold text-primary rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      {link.label}
      <ArrowRight
        className="w-4 h-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </Link>
  );
}

/** Profil singkat UVICS. */
export function AboutOverviewSection({ overview }: { overview: AboutContent["overview"] }) {
  return (
    <ContentSection id="profil" heading={overview}>
      <Reveal className="grid gap-6 md:grid-cols-3">
        {overview.paragraphs.map((paragraph) => (
          <p key={paragraph} className="leading-relaxed text-gray-600">
            {paragraph}
          </p>
        ))}
      </Reveal>
    </ContentSection>
  );
}

/** Tahun berdiri dan struktur UVICS; narasi sejarah lain menunggu data resmi (D22). */
export function AboutHistorySection({ history }: { history: AboutContent["history"] }) {
  return (
    <ContentSection id="sejarah" heading={history} muted>
      <div className="grid items-start gap-10 lg:grid-cols-12">
        <Reveal className="flex flex-col gap-4 lg:col-span-7">
          {history.paragraphs.map((paragraph) => (
            <p key={paragraph} className="leading-relaxed text-gray-700">
              {paragraph}
            </p>
          ))}
        </Reveal>
        <Reveal className="relative w-full overflow-hidden aspect-4/3 rounded-2xl lg:col-span-5">
          <Image
            src={history.image.src}
            alt={history.image.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-top"
          />
        </Reveal>
      </div>
    </ContentSection>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {items.map((item, index) => (
        <li key={item} className="flex items-start gap-3 text-gray-700">
          <span
            className="flex shrink-0 items-center justify-center w-7 h-7 text-sm font-semibold text-primary bg-primary-50 rounded-full"
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <span className="pt-0.5 leading-snug">{item}</span>
        </li>
      ))}
    </ol>
  );
}

interface AboutVisionMissionSectionProps {
  preview: AboutContent["visionMission"];
  vision: VisionMissionContent["vision"];
  mission: VisionMissionContent["mission"];
}

/** Pratinjau visi dan misi yang mengarah ke /vision-mission (D19). */
export function AboutVisionMissionSection({ preview, vision, mission }: AboutVisionMissionSectionProps) {
  const cards = [
    { label: preview.visionLabel, icon: Eye, items: vision.items },
    { label: preview.missionLabel, icon: Target, items: mission.items },
  ];

  return (
    <ContentSection id="visi-misi" heading={preview}>
      <Reveal className="grid gap-5 lg:grid-cols-2">
        {cards.map(({ label, icon: Icon, items }) => (
          <article key={label} className="flex flex-col gap-6 p-6 bg-white rounded-2xl border border-gray-200 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-11 h-11 text-primary bg-primary-50 rounded-xl">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-xl font-bold text-gray-900">{label}</h3>
            </div>
            <NumberedList items={items} />
          </article>
        ))}
      </Reveal>
      <Reveal>
        <ArrowLink link={preview.link} />
      </Reveal>
    </ContentSection>
  );
}

/** Culture & Value resmi UVICS; dipakai di /about dan /vision-mission. */
export function CultureValueSection({ content, muted }: { content: CultureValueContent; muted?: boolean }) {
  return (
    <ContentSection id="culture-value" heading={content} muted={muted}>
      <Reveal className="grid gap-5 md:grid-cols-2">
        {content.groups.map((group) => (
          <article key={group.title} className="flex flex-col gap-5 p-6 bg-white rounded-2xl border border-gray-200 sm:p-8">
            <h3 className="font-heading text-xl font-bold text-gray-900">{group.title}</h3>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item}>
                  <Badge className={PILL}>{item}</Badge>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </Reveal>
    </ContentSection>
  );
}

/** Jenis lomba yang didukung UVICS dan tautan ke program. */
export function AboutActivitiesSection({ activities }: { activities: AboutContent["activities"] }) {
  return (
    <ContentSection id="kegiatan" heading={activities}>
      <Reveal>
        <ul className="flex flex-wrap gap-3">
          {activities.competitionTypes.map((type) => (
            <li key={type}>
              <Badge className={PILL}>{type}</Badge>
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal>
        <ArrowLink link={activities.link} />
      </Reveal>
    </ContentSection>
  );
}
