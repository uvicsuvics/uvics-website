import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DepartmentIndexItem } from "@/components/departments/DepartmentIndexItem";
import { DepartmentSection } from "@/components/departments/DepartmentSection";
import { DepartmentStructure } from "@/components/departments/DepartmentStructure";
import { ProgramGrid } from "@/components/programs/ProgramGrid";
import { ClosingCtaSection } from "@/components/sections/about/ClosingCtaSection";
import { TextHero } from "@/components/sections/TextHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { getDepartmentBySlug, getDepartments, getDepartmentsPage } from "@/lib/services/departmentService";
import { departmentSummary, getActivePeriod, getPeriodMembers } from "@/lib/services/organizationService";
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
  const own = members.filter((member) => member.department === department.name);
  const { coordinator } = departmentSummary(members, department.name);
  const stats = activePeriod
    ? [
        ...(coordinator ? [{ label: detail.stats.coordinator, value: coordinator }] : []),
        // Periode baru bisa aktif sebelum membership diisi; "Pengurus 0" terbaca seperti departemen kosong.
        ...(own.length > 0 ? [{ label: detail.stats.members, value: String(own.length) }] : []),
        { label: detail.stats.period, value: activePeriod.name },
      ]
    : [];

  return (
    <div className="flex flex-col">
      <TextHero
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
          <ProgramGrid programs={programs} linkLabel={detail.programs.linkLabel} />
        )}
      </DepartmentSection>

      <DepartmentSection id="pengurus" heading={{ title: detail.membersTitle, titleHighlight: activePeriod?.name ?? "" }}>
        {own.length === 0 ? (
          <div className="pt-10">
            <EmptyState message={detail.membersEmptyMessage} />
          </div>
        ) : (
          <Reveal className="pt-10">
            <DepartmentStructure label={`${detail.structureLabel} ${department.name}`} members={own} />
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
                {...departmentSummary(members, other.name)}
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
