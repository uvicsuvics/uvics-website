import type { Metadata } from "next";
import { DepartmentIndexItem } from "@/components/departments/DepartmentIndexItem";
import { DepartmentSection } from "@/components/departments/DepartmentSection";
import { DepartmentsHero } from "@/components/departments/DepartmentsHero";
import { ClosingCtaSection } from "@/components/sections/about/ClosingCtaSection";
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
  const membersOf = (department: string) => members.filter((member) => member.department === department);
  const departmentMembers = departments.reduce((total, department) => total + membersOf(department.name).length, 0);
  const stats = [
    { label: page.stats.departments, value: String(departments.length) },
    ...(activePeriod
      ? [
          { label: page.stats.members, value: String(departmentMembers) },
          { label: page.stats.period, value: activePeriod.name },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col">
      <DepartmentsHero
        breadcrumbs={[{ label: page.hero.breadcrumbHome, href: "/" }, { label: page.hero.title }]}
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        titleHighlight={page.hero.titleHighlight}
        description={page.hero.description}
        stats={stats}
      />

      <DepartmentSection
        id="departemen"
        heading={page.list}
        note={activePeriod ? `${page.list.periodNote} ${activePeriod.name}` : undefined}
      >
        {departments.length === 0 ? (
          <div className="pt-10">
            <EmptyState message={page.list.emptyMessage} />
          </div>
        ) : (
          <Reveal>
            <ol>
              {departments.map((department, index) => {
                const own = membersOf(department.name);
                return (
                  <DepartmentIndexItem
                    key={department.id}
                    department={department}
                    number={index + 1}
                    // shortcut: koordinator dikenali dari nama posisi; ganti ke positions.level setelah U08 diputuskan.
                    coordinator={own.find((member) => member.position === "Koordinator")?.name}
                    memberCount={own.length}
                    labels={page.list}
                  />
                );
              })}
            </ol>
          </Reveal>
        )}
      </DepartmentSection>

      <ClosingCtaSection cta={page.cta} />
    </div>
  );
}
