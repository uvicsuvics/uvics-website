import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Building2 } from "lucide-react";
import { DepartmentIndexItem } from "@/components/departments/DepartmentIndexItem";
import { DepartmentSection } from "@/components/departments/DepartmentSection";
import { ProgramGrid } from "@/components/programs/ProgramGrid";
import { ClosingCtaSection } from "@/components/sections/about/ClosingCtaSection";
import { TextHero } from "@/components/sections/TextHero";
import { getDepartments, getDepartmentsPage } from "@/lib/services/departmentService";
import { departmentSummary, getActivePeriod, getPeriodMembers } from "@/lib/services/organizationService";
import {
  getProgramBySlug,
  getProgramDepartmentSlug,
  getPrograms,
  getProgramsByDepartment,
  getProgramsPage,
} from "@/lib/services/programService";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getPrograms()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const program = await getProgramBySlug((await params).slug);
  if (!program) {
    return { title: "Program Tidak Ditemukan | UVICS" };
  }
  return { title: `${program.title} | Program UVICS`, description: program.description };
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [programs, page, departmentSlug] = await Promise.all([
    getPrograms(),
    getProgramsPage(),
    getProgramDepartmentSlug(slug),
  ]);
  // Nomor tampilan mengikuti urutan resmi yang sama dengan /programs.
  const index = programs.findIndex((program) => program.slug === slug);

  if (index === -1) {
    notFound();
  }

  const program = programs[index];
  const { detail } = page;
  const [departments, departmentsPage, activePeriod, siblings] = await Promise.all([
    getDepartments(),
    getDepartmentsPage(),
    getActivePeriod(),
    departmentSlug ? getProgramsByDepartment(departmentSlug) : Promise.resolve([]),
  ]);
  const departmentIndex = departments.findIndex((department) => department.slug === departmentSlug);
  const department = departmentIndex === -1 ? null : departments[departmentIndex];
  const members = department && activePeriod ? await getPeriodMembers(activePeriod.id) : [];
  const sameDepartment = siblings.filter((sibling) => sibling.slug !== slug);
  // Tiga program sesudah program ini (memutar ke awal), di luar program sedepartemen.
  const others = [...programs.slice(index + 1), ...programs.slice(0, index)]
    .filter((other) => !siblings.some((sibling) => sibling.slug === other.slug))
    .slice(0, 3);

  return (
    <div className="flex flex-col">
      <TextHero
        breadcrumbs={[
          { label: detail.breadcrumbHome, href: "/" },
          { label: detail.breadcrumbParent, href: "/programs" },
          { label: program.title },
        ]}
        eyebrow={`${detail.eyebrowPrefix} ${String(index + 1).padStart(2, "0")}`}
        title={program.title}
        description={program.description}
        media={
          <div className="relative w-full overflow-hidden aspect-[4/3] rounded-2xl lg:shrink-0 lg:w-[34rem]">
            <Image
              src={program.image}
              alt={program.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 544px"
              className="object-cover"
            />
          </div>
        }
      >
        {department && (
          <Link
            href={`/departments/${department.slug}`}
            className="group inline-flex items-center self-start gap-2.5 py-2 pr-4 pl-2 text-sm font-semibold text-primary-900 bg-primary-50 rounded-full transition-colors hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <span className="flex items-center justify-center w-8 h-8 text-white bg-primary rounded-full">
              <Building2 className="w-4 h-4" aria-hidden="true" />
            </span>
            {`${detail.managedByLabel} ${department.name}`}
            <ArrowRight
              className="w-4 h-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>
        )}
      </TextHero>

      {department && (
        <DepartmentSection id="departemen-pengelola" heading={detail.department}>
          <ol>
            <DepartmentIndexItem
              department={department}
              number={departmentIndex + 1}
              {...departmentSummary(members, department.name)}
              labels={departmentsPage.list}
            />
          </ol>
        </DepartmentSection>
      )}

      {department && sameDepartment.length > 0 && (
        <DepartmentSection id="program-departemen" heading={{ title: detail.siblingsTitle, titleHighlight: department.name }}>
          <ProgramGrid programs={sameDepartment} linkLabel={page.list.linkLabel} />
        </DepartmentSection>
      )}

      {others.length > 0 && (
        <DepartmentSection id="program-lainnya" heading={detail.others}>
          <ProgramGrid programs={others} linkLabel={page.list.linkLabel} />
        </DepartmentSection>
      )}

      <ClosingCtaSection cta={detail.cta} />
    </div>
  );
}
