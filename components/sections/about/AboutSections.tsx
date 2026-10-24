import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  Eye,
  HeartHandshake,
  Share2,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { ContentSection } from "@/components/sections/about/ContentSection";
import type { ActivityItem, AboutContent, CoreValueItem, VisionMissionContent } from "@/data/mock/about";

const VALUE_ICONS: Record<CoreValueItem["iconName"], LucideIcon> = {
  Shield,
  Trophy,
  Users,
  Sparkles,
  TrendingUp,
  HeartHandshake,
};

const ACTIVITY_ICONS: Record<ActivityItem["iconName"], LucideIcon> = { Trophy, BookOpen, Cpu, Share2 };

/** Profil singkat UVICS dan statistik utama. */
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
      <Reveal>
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {overview.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 p-5 bg-white rounded-2xl border border-gray-200 sm:p-6">
              <dt className="order-2 text-sm font-semibold text-gray-900">{stat.label}</dt>
              <dd className="order-1 font-heading text-3xl font-bold text-primary">{stat.value}</dd>
              <dd className="order-3 text-sm text-gray-600">{stat.description}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </ContentSection>
  );
}

/** Latar belakang berdirinya UVICS. */
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
          <p className="flex items-start gap-3 p-4 text-sm font-medium text-gray-800 bg-white rounded-xl border border-gray-200">
            <Trophy className="shrink-0 mt-0.5 w-5 h-5 text-primary" aria-hidden="true" />
            {history.turningPoint}
          </p>
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

interface AboutVisionMissionSectionProps {
  preview: AboutContent["visionMission"];
  vision: VisionMissionContent["vision"];
  mission: VisionMissionContent["mission"];
}

/** Pratinjau visi dan misi yang mengarah ke /vision-mission (D19). */
export function AboutVisionMissionSection({ preview, vision, mission }: AboutVisionMissionSectionProps) {
  return (
    <ContentSection id="visi-misi" heading={preview}>
      <Reveal className="grid gap-6 lg:grid-cols-2">
        <article className="flex flex-col gap-4 p-6 text-white bg-primary rounded-2xl sm:p-8">
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-secondary uppercase">
            <Eye className="w-4 h-4" aria-hidden="true" />
            {preview.visionLabel}
          </h3>
          <p className="font-heading text-2xl font-semibold leading-snug">{vision.statement}</p>
        </article>
        <article className="flex flex-col gap-4 p-6 bg-white rounded-2xl border border-gray-200 sm:p-8">
          <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-primary uppercase">
            <Target className="w-4 h-4" aria-hidden="true" />
            {preview.missionLabel}
          </h3>
          <ol className="flex flex-col gap-3">
            {mission.items.map((item) => (
              <li key={item.number} className="flex gap-3 text-gray-700">
                <span className="font-mono font-bold text-primary" aria-hidden="true">
                  {item.number}
                </span>
                {item.title}
              </li>
            ))}
          </ol>
        </article>
      </Reveal>
      <Reveal>
        <Link
          href={preview.link.href}
          className="inline-flex items-center gap-2 font-semibold text-primary rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {preview.link.label}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </Reveal>
    </ContentSection>
  );
}

/** Enam nilai inti UVICS. */
export function AboutValuesSection({ values }: { values: AboutContent["values"] }) {
  return (
    <ContentSection id="nilai" heading={values} muted>
      <Reveal>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {values.items.map((item) => {
            const Icon = VALUE_ICONS[item.iconName];
            return (
              <li key={item.id} className="flex flex-col gap-3 p-6 bg-white rounded-2xl border border-gray-200">
                <span className="flex items-center justify-center w-11 h-11 text-primary bg-primary-50 rounded-xl">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-xl font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{item.description}</p>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </ContentSection>
  );
}

/** Bidang kegiatan utama UVICS. */
export function AboutActivitiesSection({ activities }: { activities: AboutContent["activities"] }) {
  return (
    <ContentSection id="kegiatan" heading={activities}>
      <Reveal>
        <ul className="grid gap-5 md:grid-cols-2">
          {activities.items.map((item) => {
            const Icon = ACTIVITY_ICONS[item.iconName];
            return (
              <li key={item.id} className="flex flex-col gap-4 p-6 bg-white rounded-2xl border border-gray-200 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center justify-center w-11 h-11 text-primary bg-primary-50 rounded-xl">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <Badge>{item.category}</Badge>
                </div>
                <h3 className="font-heading text-xl font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{item.description}</p>
                <dl className="grid gap-3 mt-auto pt-4 text-sm border-t border-gray-100 sm:grid-cols-2">
                  <div>
                    <dt className="text-gray-500">{activities.scheduleLabel}</dt>
                    <dd className="font-medium text-gray-900">{item.schedule}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">{activities.outputLabel}</dt>
                    <dd className="font-medium text-gray-900">{item.output}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </ContentSection>
  );
}

/** Linimasa vertikal perkembangan UVICS. */
export function AboutMilestonesSection({ milestones }: { milestones: AboutContent["milestones"] }) {
  return (
    <ContentSection id="tonggak" heading={milestones} muted>
      <Reveal>
        <ol className="flex flex-col gap-10 ml-2 pl-8 border-l-2 border-primary-100">
          {milestones.items.map((item) => (
            <li key={item.year} className="relative flex flex-col gap-2">
              {/* Titik 16px di tengah garis 2px: 32px padding + 1px setengah garis + 8px setengah titik. */}
              <span
                className="absolute top-1 -left-[41px] w-4 h-4 bg-primary rounded-full ring-4 ring-muted"
                aria-hidden="true"
              />
              <p className="font-mono text-sm font-bold text-primary">{item.year}</p>
              <h3 className="font-heading text-xl font-bold text-gray-900">{item.title}</h3>
              <p className="max-w-3xl leading-relaxed text-gray-600">{item.description}</p>
              <ul className="flex flex-col gap-1.5 pt-1">
                {item.achievements.map((achievement) => (
                  <li key={achievement} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="shrink-0 mt-0.5 w-4 h-4 text-primary" aria-hidden="true" />
                    {achievement}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Reveal>
    </ContentSection>
  );
}
