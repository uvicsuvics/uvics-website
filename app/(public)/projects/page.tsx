import type { Metadata } from "next";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { ProjectsExplorer } from "@/components/portfolio/ProjectsExplorer";
import { PageHero } from "@/components/sections/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { getProjects, getProjectsPage } from "@/lib/services/projectService";

const description = "Karya dan proyek teknologi yang dibangun anggota UVICS.";

export const metadata: Metadata = { title: "Project | UVICS", description };

export default async function ProjectsPage() {
  const [page, items] = await Promise.all([getProjectsPage(), getProjects()]);

  if (items.length === 0) {
    return (
      <div>
        <PageHero hero={page.hero} />
        <div className="mx-auto px-4 py-12 w-full max-w-7xl sm:px-6 lg:px-8">
          <EmptyState message="Belum ada project yang tersedia." />
        </div>
      </div>
    );
  }

  const featured = items.filter(({ project }) => project.featured);

  return (
    <div>
      <PageHero hero={page.hero} />

      {featured.length > 0 ? (
        <section
          aria-labelledby="featured-projects-heading"
          className="flex flex-col gap-6 mx-auto px-4 pt-12 w-full max-w-7xl sm:px-6 lg:px-8 lg:pt-16"
        >
          <h2 id="featured-projects-heading" className="font-heading text-2xl font-bold text-gray-900">
            Project Unggulan
          </h2>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(({ project }) => (
              <li key={project.id}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ProjectsExplorer items={items} />
    </div>
  );
}
