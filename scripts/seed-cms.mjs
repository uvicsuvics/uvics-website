import { operatorClient } from "./tooling.mjs";

const competitions = [
  {
    title: "UI/UX Competition",
    slug: "ui-ux-competition",
    organizer: "Example University",
    category: "UI/UX",
    level: "National",
    registration_deadline: "2026-10-10",
    competition_date: "2026-10-20",
    status: "OPEN",
    poster_url: "/storage/competition.webp"
  },
  {
    title: "Competitive Programming",
    slug: "cp-competition-2026",
    organizer: "Tech Institute",
    category: "Programming",
    level: "International",
    registration_deadline: "2026-11-01",
    competition_date: "2026-11-15",
    status: "UPCOMING",
  }
];

const achievements = [
  {
    title: "1st Place Hackathon",
    slug: "1st-place-hackathon-2026",
    competition_name: "Global Tech Hackathon",
    organizer: "Tech Corp",
    level: "International",
    ranking: "1st Place",
    achievement_date: "2026-08-15",
    description: "Won first place with our innovative AI solution.",
    published: true,
  }
];

const projects = [
  {
    title: "Campus Smart Access",
    slug: "campus-smart-access",
    summary: "RFID and AI based campus access system",
    description: "A comprehensive project to upgrade campus security and access management.",
    start_date: "2026-01-10",
    status: "ONGOING",
    featured: true,
  }
];

async function seed() {
  const supabase = operatorClient();
  console.log("Seeding CMS Data...");

  // Seed Competitions
  for (const comp of competitions) {
    const { error } = await supabase.from("competitions").upsert(comp, { onConflict: "slug" });
    if (error) console.error("Error seeding competition:", error);
  }

  // Seed Achievements & Members
  for (const ach of achievements) {
    const { data, error } = await supabase.from("achievements").upsert(ach, { onConflict: "slug" }).select().single();
    if (error) {
      console.error("Error seeding achievement:", error);
      continue;
    }
    // Add members
    await supabase.from("achievement_members").delete().eq("achievement_id", data.id);
    await supabase.from("achievement_members").insert([
      { achievement_id: data.id, member_name: "Alice", role: "Team Leader" },
      { achievement_id: data.id, member_name: "Bob", role: "Developer" }
    ]);
  }

  // Seed Projects & Members
  for (const proj of projects) {
    const { data, error } = await supabase.from("projects").upsert(proj, { onConflict: "slug" }).select().single();
    if (error) {
      console.error("Error seeding project:", error);
      continue;
    }
    await supabase.from("project_members").delete().eq("project_id", data.id);
    await supabase.from("project_members").insert([
      { project_id: data.id, member_name: "Charlie", role: "Project Manager" },
      { project_id: data.id, member_name: "Dave", role: "Engineer" }
    ]);
  }

  console.log("Seeding CMS Data Completed.");
}

seed().catch(console.error);
