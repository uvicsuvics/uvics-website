import type { Metadata } from "next";
import { DepartmentCard } from "@/components/departments/DepartmentCard";
import { PageHero } from "@/components/sections/PageHero";
import { ContentSection } from "@/components/sections/about/ContentSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { getDepartments, getDepartmentsPage } from "@/lib/services/departmentService";
import { getActivePeriod, getPeriodMembers } from "@/lib/services/organizationService";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDepartmentsPage();
  return { title: meta.title, description: meta.description };
}

export default async function DepartmentsPage() {
  const [page, departments, activePeriod] = await Promise.all([
    getDepartmentsPage(),
    getDepartments(),
    getActivePeriod(),
  ]);
  const members = activePeriod ? await getPeriodMembers(activePeriod.id) : [];
  // shortcut: koordinator dikenali dari nama posisi; ganti ke positions.level setelah U08 diputuskan.
  const coordinatorOf = (department: string) =>
    members.find((member) => member.department === department && member.position === "Koordinator")?.name;

  return (
    <div className="flex flex-col">
      <PageHero hero={page.hero} />
      <ContentSection id="departemen" heading={page.list}>
        <Reveal>
          {departments.length === 0 ? (
            <EmptyState message={page.list.emptyMessage} />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((department) => (
                <li key={department.id}>
                  <DepartmentCard
                    department={department}
                    coordinator={coordinatorOf(department.name)}
                    coordinatorLabel={page.list.coordinatorLabel}
                    linkLabel={page.list.linkLabel}
                  />
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </ContentSection>
    </div>
  );
}
