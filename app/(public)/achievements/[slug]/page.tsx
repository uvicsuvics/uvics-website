import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Building2, CalendarDays, Flag, Trophy, UserRound } from "lucide-react";
import { AchievementCard } from "@/components/portfolio/AchievementCard";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { LEVEL_LABELS, formatPortfolioDate } from "@/components/portfolio/portfolioLabels";
import { Badge } from "@/components/ui/Badge";
import {
  getAchievementDetail,
  getRelatedAchievements,
  listAchievements,
} from "@/lib/services/portfolioService";

interface AchievementDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const items = await listAchievements();
  return items.map(({ achievement }) => ({ slug: achievement.slug }));
}

export async function generateMetadata({ params }: AchievementDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getAchievementDetail(slug);

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
  const detail = await getAchievementDetail(slug);

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
    level ? { icon: Trophy, label: "Level", value: LEVEL_LABELS[level] } : null,
  ].filter((row) => row !== null);

  return (
    <div className="pb-16 lg:pb-24">
      {/* Header */}
      <header className="bg-primary-50/60 border-b border-gray-200/90">
        <div className="flex flex-col gap-5 mx-auto px-4 pt-28 pb-10 w-full max-w-7xl sm:px-6 lg:px-8 lg:pt-32 lg:pb-14">
          <Link
            href="/achievements"
            className="inline-flex items-center gap-1.5 w-fit text-sm font-medium text-primary transition-colors hover:text-primary-600"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Semua Prestasi
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="px-2.5 py-1 font-semibold bg-secondary text-gray-900">
              <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
              {ranking}
            </Badge>
            {level ? <Badge variant="accent">{LEVEL_LABELS[level]}</Badge> : null}
          </div>

          <h1 className="max-w-4xl font-heading text-3xl font-bold leading-tight text-gray-900 text-balance sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          <p className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarDays className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <time dateTime={achievementDate}>{formatPortfolioDate(achievementDate)}</time>
          </p>
        </div>
      </header>

      <div className="grid gap-8 mx-auto px-4 pt-10 w-full max-w-7xl sm:px-6 lg:grid-cols-3 lg:gap-10 lg:px-8 lg:pt-14">
        {/* Main column */}
        <div className="flex flex-col gap-10 lg:col-span-2">
          <div className="relative w-full overflow-hidden aspect-video bg-primary-50 rounded-2xl border border-gray-200/90 shadow-sm">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={`Dokumentasi prestasi ${title}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover object-center"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <Trophy className="w-16 h-16 text-primary-200" aria-hidden="true" />
              </div>
            )}
          </div>

          <section aria-labelledby="description-heading" className="flex flex-col gap-3">
            <h2 id="description-heading" className="font-heading text-xl font-bold text-gray-900 sm:text-2xl">
              Deskripsi
            </h2>
            <p className="leading-relaxed text-gray-700">{description}</p>
          </section>

          <section aria-labelledby="team-heading" className="flex flex-col gap-4">
            <h2 id="team-heading" className="font-heading text-xl font-bold text-gray-900 sm:text-2xl">
              Tim
            </h2>
            {members.length > 0 ? (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center gap-3 p-4 bg-card rounded-xl border border-gray-200/90 shadow-2xs"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 text-primary shrink-0">
                      <UserRound className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                      {member.role ? <p className="text-xs text-gray-500 truncate">{member.role}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Data tim belum tersedia.</p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <section
            aria-labelledby="result-heading"
            className="flex flex-col gap-2 p-6 text-white bg-primary rounded-2xl shadow-primary"
          >
            <h2 id="result-heading" className="text-xs font-semibold tracking-wide uppercase text-primary-100">
              Hasil
            </h2>
            <p className="flex items-center gap-3 font-heading text-3xl font-bold">
              <Trophy className="w-8 h-8 text-secondary shrink-0" aria-hidden="true" />
              {ranking}
            </p>
          </section>

          <section
            aria-labelledby="competition-info-heading"
            className="flex flex-col gap-4 p-6 bg-card rounded-2xl border border-gray-200/90 shadow-2xs"
          >
            <h2 id="competition-info-heading" className="font-heading text-lg font-bold text-gray-900">
              Informasi Kompetisi
            </h2>
            <dl className="flex flex-col gap-4">
              {competitionInfo.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 mt-1 text-gray-400 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-xs text-gray-500">{label}</dt>
                    <dd className="text-sm font-medium text-gray-900">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {project ? (
            <section aria-labelledby="related-project-heading" className="flex flex-col gap-3">
              <h2 id="related-project-heading" className="font-heading text-lg font-bold text-gray-900">
                Project Terkait
              </h2>
              <ProjectCard project={project} />
            </section>
          ) : null}
        </aside>
      </div>

      {related.length > 0 ? (
        <section
          aria-labelledby="related-achievements-heading"
          className="flex flex-col gap-6 mx-auto px-4 pt-14 w-full max-w-7xl sm:px-6 lg:px-8 lg:pt-20"
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
