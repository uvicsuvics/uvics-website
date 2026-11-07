import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Building2, CalendarDays, Flag, Medal, Trophy } from "lucide-react";
import { AchievementCard } from "@/components/portfolio/AchievementCard";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { TeamMemberList } from "@/components/portfolio/TeamMemberList";
import { LEVEL_LABELS, formatPortfolioDate } from "@/components/portfolio/portfolioLabels";
import {
  getAchievementBySlug,
  getAchievements,
  getRelatedAchievements,
} from "@/lib/services/achievementService";
import { cn } from "@/lib/utils";

interface AchievementDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const items = await getAchievements();
  return items.map(({ achievement }) => ({ slug: achievement.slug }));
}

export async function generateMetadata({ params }: AchievementDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getAchievementBySlug(slug);

  if (!detail) {
    return {
      title: "Prestasi Tidak Ditemukan | UVICS",
      description: "Prestasi yang Anda cari tidak tersedia di UVICS.",
    };
  }

  return {
    title: `${detail.achievement.title} | Prestasi UVICS`,
    description: detail.achievement.description,
  };
}

export default async function AchievementDetailPage({ params }: AchievementDetailPageProps) {
  const { slug } = await params;
  const detail = await getAchievementBySlug(slug);

  if (!detail) {
    notFound();
  }

  const { achievement, members, project } = detail;
  const { title, competitionName, organizer, level, ranking, achievementDate, description, coverImage } =
    achievement;
  const related = await getRelatedAchievements(slug);

  const competitionInfo = [
    { icon: Flag, label: "Kompetisi", value: competitionName },
    organizer ? { icon: Building2, label: "Penyelenggara", value: organizer } : null,
    level ? { icon: Medal, label: "Level", value: LEVEL_LABELS[level] } : null,
    {
      icon: CalendarDays,
      label: "Tanggal",
      value: <time dateTime={achievementDate}>{formatPortfolioDate(achievementDate)}</time>,
    },
  ].filter((row) => row !== null);

  return (
    <div className="flex flex-col gap-14 mx-auto px-4 pt-28 pb-16 w-full max-w-7xl sm:px-6 lg:gap-20 lg:px-8 lg:pt-32 lg:pb-24">
      {/* Hero: foto di kiri, ringkasan prestasi di kanan (bertumpuk di mobile) */}
      <header className="grid overflow-hidden bg-card rounded-xl border border-gray-200/90 shadow-sm lg:grid-cols-5">
        <div className="relative w-full aspect-16/10 bg-primary-50 lg:col-span-3 lg:aspect-auto lg:min-h-96">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={`Dokumentasi prestasi ${title}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <Trophy className="w-16 h-16 text-primary-200" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:col-span-2 lg:justify-center">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50 text-primary shrink-0">
              <Trophy className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">Hasil</p>
              <p className="font-heading text-lg font-bold text-primary">{ranking}</p>
            </div>
          </div>

          <h1 className="font-heading text-2xl font-bold leading-tight text-gray-900 text-balance sm:text-3xl">
            {title}
          </h1>

          <dl className="flex flex-col border-t border-gray-100 divide-y divide-gray-100">
            {competitionInfo.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 py-3 text-sm">
                <dt className="flex items-center gap-2 w-32 text-gray-500 shrink-0">
                  <Icon className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                  {label}
                </dt>
                <dd className="min-w-0 font-medium text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="grid gap-12 lg:grid-cols-3 lg:gap-10">
        <div className={cn("flex flex-col gap-12", project ? "lg:col-span-2" : "lg:col-span-3 max-w-4xl")}>
          <section aria-labelledby="description-heading" className="flex flex-col gap-4">
            <h2 id="description-heading" className="font-heading text-xl font-bold text-gray-900 sm:text-2xl">
              Tentang Prestasi
            </h2>
            <p className="leading-relaxed text-gray-700 sm:text-lg">{description}</p>
          </section>

          <section aria-labelledby="team-heading" className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="team-heading" className="font-heading text-xl font-bold text-gray-900 sm:text-2xl">
                Tim
              </h2>
              {members.length > 0 ? <p className="text-sm text-gray-500">{members.length} anggota</p> : null}
            </div>
            <TeamMemberList members={members} />
          </section>
        </div>

        {project ? (
          <aside aria-labelledby="related-project-heading" className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
            <h2 id="related-project-heading" className="font-heading text-xl font-bold text-gray-900 sm:text-2xl">
              Project Terkait
            </h2>
            <ProjectCard project={project} />
          </aside>
        ) : null}
      </div>

      {related.length > 0 ? (
        <section
          aria-labelledby="related-achievements-heading"
          className="flex flex-col gap-6 pt-12 border-t border-gray-200/90 lg:pt-16"
        >
          <h2 id="related-achievements-heading" className="font-heading text-2xl font-bold text-gray-900">
            Prestasi Lainnya
          </h2>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(({ achievement: item, members: itemMembers }) => (
              <li key={item.id}>
                <AchievementCard achievement={item} members={itemMembers.map((member) => member.name)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
