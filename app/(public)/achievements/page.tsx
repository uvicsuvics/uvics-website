import type { Metadata } from "next";
import { AchievementsExplorer } from "@/components/portfolio/AchievementsExplorer";
import { EmptyState } from "@/components/portfolio/EmptyState";
import { FeaturedAchievement } from "@/components/portfolio/FeaturedAchievement";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { getAchievements } from "@/lib/services/achievementService";

const description = "Capaian mahasiswa UVICS di kompetisi nasional dan internasional.";

export const metadata: Metadata = { title: "Prestasi | UVICS", description };

export default async function AchievementsPage() {
  const items = await getAchievements();

  if (items.length === 0) {
    return (
      <div>
        <PortfolioHero title="Prestasi UVICS" description={description} />
        <div className="mx-auto px-4 py-12 w-full max-w-7xl sm:px-6 lg:px-8">
          <EmptyState message="Belum ada prestasi yang tersedia saat ini." />
        </div>
      </div>
    );
  }

  // Data prestasi belum punya penanda featured; daftar sudah terurut terbaru, jadi yang pertama disorot.
  const [featured] = items;
  const nationalPlus = items.filter(
    ({ achievement }) => achievement.level === "NASIONAL" || achievement.level === "INTERNASIONAL",
  ).length;
  const participants = new Set(items.flatMap(({ members }) => members.map((member) => member.name))).size;

  const stats = [
    { label: "Total Prestasi", value: items.length },
    { label: "Tingkat Nasional & Internasional", value: nationalPlus },
    { label: "Anggota Terlibat", value: participants },
  ];

  return (
    <div>
      <PortfolioHero title="Prestasi UVICS" description={description} />

      <section
        aria-label="Statistik prestasi"
        className="mx-auto px-4 -mt-8 w-full max-w-7xl relative sm:px-6 lg:px-8"
      >
        <dl className="grid grid-cols-1 gap-px overflow-hidden bg-gray-200 rounded-2xl border border-gray-200 shadow-md sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 px-6 py-5 bg-white">
              <dd className="order-2 text-sm text-gray-600">{stat.label}</dd>
              <dt className="order-1 font-heading text-3xl font-bold text-primary">{stat.value}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="featured-achievement-heading"
        className="flex flex-col gap-6 mx-auto px-4 pt-12 w-full max-w-7xl sm:px-6 lg:px-8 lg:pt-16"
      >
        <h2 id="featured-achievement-heading" className="font-heading text-2xl font-bold text-gray-900">
          Prestasi Unggulan
        </h2>
        <FeaturedAchievement achievement={featured.achievement} />
      </section>

      <AchievementsExplorer items={items} />
    </div>
  );
}
