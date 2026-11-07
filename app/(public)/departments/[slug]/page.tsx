import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DepartmentIndexItem } from "@/components/departments/DepartmentIndexItem";
import { DepartmentSection } from "@/components/departments/DepartmentSection";
import { DepartmentsHero } from "@/components/departments/DepartmentsHero";
import { MemberCard } from "@/components/organization/MemberCard";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { ClosingCtaSection } from "@/components/sections/about/ClosingCtaSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { getDepartmentBySlug, getDepartments, getDepartmentsPage } from "@/lib/services/departmentService";
import { getActivePeriod, getPeriodMembers } from "@/lib/services/organizationService";
import { getProgramsByDepartment } from "@/lib/services/programService";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getDepartments()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const department = await getDepartmentBySlug((await params).slug);

  if (!department) {
    return { title: "Departemen Tidak Ditemukan | UVICS" };
  }

  return { title: `${department.name} | Departemen UVICS`, description: department.description };
}

export default async function DepartmentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [departments, page, activePeriod, programs] = await Promise.all([
    getDepartments(),
    getDepartmentsPage(),
    getActivePeriod(),
    getProgramsByDepartment(slug),
  ]);
  // Nomor tampilan mengikuti urutan resmi yang sama dengan /departments.
  const index = departments.findIndex((department) => department.slug === slug);

  if (index === -1) {
    notFound();
  }

  const department = departments[index];
  const { detail } = page;
  const members = activePeriod ? await getPeriodMembers(activePeriod.id) : [];
  const membersOf = (name: string) => members.filter((member) => member.department === name);
  // shortcut: koordinator dikenali dari nama posisi; ganti ke positions.level setelah U08 diputuskan.
  const coordinatorOf = (name: string) => membersOf(name).find((member) => member.position === "Koordinator")?.name;
  const own = membersOf(department.name);
  const coordinator = coordinatorOf(department.name);
  const stats = activePeriod
    ? [
        ...(coordinator ? [{ label: detail.stats.coordinator, value: coordinator }] : []),
        { label: detail.stats.members, value: String(own.length) },
        { label: detail.stats.period, value: activePeriod.name },
      ]
    : [];

  return (
    <div className="flex flex-col">
      <DepartmentsHero
        breadcrumbs={[
          { label: page.hero.breadcrumbHome, href: "/" },
          { label: detail.breadcrumbParent, href: "/departments" },
          { label: department.name },
        ]}
        eyebrow={`${detail.eyebrowPrefix} ${String(index + 1).padStart(2, "0")}`}
        title={department.name}
        description={department.description}
        stats={stats}
      />

      <DepartmentSection id="program" heading={detail.programs}>
        {programs.length === 0 ? (
          <div className="pt-10">
            <EmptyState message={detail.programs.emptyMessage} />
          </div>
        ) : (
          <Reveal className="pt-10">
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map((program) => (
                <li key={program.id}>
                  <ProgramCard program={program} linkLabel={detail.programs.linkLabel} />
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </DepartmentSection>

      <DepartmentSection id="pengurus" heading={{ title: detail.membersTitle, titleHighlight: activePeriod?.name ?? "" }}>
        {own.length === 0 ? (
          <div className="pt-10">
            <EmptyState message={detail.membersEmptyMessage} />
          </div>
        ) : (
          <Reveal className="pt-10">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {own.map((member) => (
                <li key={`${member.name}-${member.position}`}>
                  <MemberCard member={member} />
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </DepartmentSection>

      <DepartmentSection id="departemen-lainnya" heading={detail.others}>
        <ol>
          {departments.map((other, otherIndex) =>
            other.slug === slug ? null : (
              <DepartmentIndexItem
                key={other.id}
                department={other}
                number={otherIndex + 1}
                coordinator={coordinatorOf(other.name)}
                memberCount={membersOf(other.name).length}
                labels={page.list}
              />
            ),
          )}
        </ol>
      </DepartmentSection>

      <ClosingCtaSection cta={detail.cta} />
    </div>
  );
}
