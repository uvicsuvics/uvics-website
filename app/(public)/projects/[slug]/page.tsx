import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, CalendarDays, FolderGit2, Globe, UserRound } from "lucide-react";
import { IconBrandGithub } from "@tabler/icons-react";
import { AchievementCard } from "@/components/portfolio/AchievementCard";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { PROJECT_STATUS_CONFIG, formatPortfolioPeriod } from "@/components/portfolio/portfolioLabels";
import { Badge } from "@/components/ui/Badge";
import { getProjectBySlug, getProjects, getRelatedProjects } from "@/lib/services/projectService";
import { cn } from "@/lib/utils";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const items = await getProjects();
  return items.map(({ project }) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getProjectBySlug(slug);

  if (!detail) {
    return {
      title: "Project Tidak Ditemukan | UVICS",
      description: "Project yang Anda cari tidak tersedia di UVICS.",
    };
  }

  return {
    title: `${detail.project.title} | Project UVICS`,
    description: detail.project.summary,
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const detail = await getProjectBySlug(slug);

  if (!detail) {
    notFound();
  }

  const { project, members, achievements } = detail;
  const { title, summary, description, coverImage, status, startDate, endDate, projectUrl, repositoryUrl } = project;
  const { label: statusLabel, badgeClassName } = PROJECT_STATUS_CONFIG[status];
  const period = formatPortfolioPeriod(startDate, endDate);
  const relatedProjects = await getRelatedProjects(slug);

  const links = [
    projectUrl ? { icon: Globe, label: "Live Demo", href: projectUrl } : null,
    repositoryUrl ? { icon: IconBrandGithub, label: "GitHub", href: repositoryUrl } : null,
  ].filter((link) => link !== null);

  return (
    <div className="pb-16 lg:pb-24">
      {/* Hero */}
      <header className="bg-primary-50/60 border-b border-gray-200/90">
        <div className="flex flex-col gap-5 mx-auto px-4 pt-28 pb-10 w-full max-w-7xl sm:px-6 lg:px-8 lg:pt-32 lg:pb-14">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 w-fit text-sm font-medium text-primary transition-colors hover:text-primary-600"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Semua Project
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("px-2.5 py-1 font-semibold", badgeClassName)}>{statusLabel}</Badge>
          </div>

          <h1 className="max-w-4xl font-heading text-3xl font-bold leading-tight text-gray-900 text-balance sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="max-w-3xl leading-relaxed text-gray-600 sm:text-lg">{summary}</p>

          {period ? (
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="w-4 h-4 text-gray-400" aria-hidden="true" />
              {period}
            </p>
          ) : null}
        </div>
      </header>

      <div className="grid gap-8 mx-auto px-4 pt-10 w-full max-w-7xl sm:px-6 lg:grid-cols-3 lg:gap-10 lg:px-8 lg:pt-14">
        {/* Main column */}
        <div className="flex flex-col gap-10 lg:col-span-2">
          <div className="relative w-full overflow-hidden aspect-video bg-primary-50 rounded-2xl border border-gray-200/90 shadow-sm">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={`Cover project ${title}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover object-center"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <FolderGit2 className="w-16 h-16 text-primary-200" aria-hidden="true" />
              </div>
            )}
          </div>

          <section aria-labelledby="overview-heading" className="flex flex-col gap-3">
            <h2 id="overview-heading" className="font-heading text-xl font-bold text-gray-900 sm:text-2xl">
              Ikhtisar
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
            aria-labelledby="links-heading"
            className="flex flex-col gap-4 p-6 bg-card rounded-2xl border border-gray-200/90 shadow-2xs"
          >
            <h2 id="links-heading" className="font-heading text-lg font-bold text-gray-900">
              Tautan Project
            </h2>
            {links.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {links.map(({ icon: Icon, label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-4 py-3 text-sm font-semibold text-primary rounded-lg border border-primary/30 transition-colors duration-200 ease-standard hover:text-white hover:bg-primary hover:border-primary"
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span className="flex-1">{label}</span>
                      <ArrowUpRight
                        className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Belum ada tautan untuk project ini.</p>
            )}
          </section>
        </aside>
      </div>

      {achievements.length > 0 ? (
        <section
          aria-labelledby="related-achievements-heading"
          className="flex flex-col gap-6 mx-auto px-4 pt-14 w-full max-w-7xl sm:px-6 lg:px-8 lg:pt-20"
        >
          <h2 id="related-achievements-heading" className="font-heading text-2xl font-bold text-gray-900">
            Prestasi Terkait
          </h2>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map(({ achievement, members: achievementMembers }) => (
              <li key={achievement.id}>
                <AchievementCard
                  achievement={achievement}
                  members={achievementMembers.map((member) => member.name)}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {relatedProjects.length > 0 ? (
        <section
          aria-labelledby="related-projects-heading"
          className="flex flex-col gap-6 mx-auto px-4 pt-14 w-full max-w-7xl sm:px-6 lg:px-8 lg:pt-20"
        >
          <h2 id="related-projects-heading" className="font-heading text-2xl font-bold text-gray-900">
            Project Lainnya
          </h2>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProjects.map(({ project: item }) => (
              <li key={item.id}>
                <ProjectCard project={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
