import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MemberCard } from "@/components/organization/MemberCard";
import { PageHero } from "@/components/sections/PageHero";
import { ClosingCtaSection } from "@/components/sections/about/ClosingCtaSection";
import { ContentSection } from "@/components/sections/about/ContentSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { getDepartmentBySlug, getDepartments, getDepartmentsPage } from "@/lib/services/departmentService";
import { getActivePeriod, getPeriodMembers } from "@/lib/services/organizationService";

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
  const [department, page, activePeriod] = await Promise.all([
    getDepartmentBySlug((await params).slug),
    getDepartmentsPage(),
    getActivePeriod(),
  ]);
  if (!department) {
    notFound();
  }
  const members = activePeriod
    ? (await getPeriodMembers(activePeriod.id)).filter((member) => member.department === department.name)
    : [];

  return (
    <div className="flex flex-col">
      <PageHero
        hero={{
          title: page.hero.title,
          titleHighlight: department.name,
          description: department.description,
          image: page.hero.image,
        }}
      />
      <ContentSection
        id="pengurus"
        heading={{ title: page.detail.membersTitle, titleHighlight: activePeriod?.name ?? "" }}
      >
        <Reveal>
          {members.length === 0 ? (
            <EmptyState message={page.detail.membersEmptyMessage} />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((member) => (
                <li key={`${member.name}-${member.position}`}>
                  <MemberCard member={member} />
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </ContentSection>
      <ClosingCtaSection cta={page.detail.cta} />
    </div>
  );
}
