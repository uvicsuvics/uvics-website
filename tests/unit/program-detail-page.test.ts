import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProgramDetailPage from "@/app/(public)/programs/[slug]/page";

const render = async (slug: string) =>
  renderToStaticMarkup(await ProgramDetailPage({ params: Promise.resolve({ slug }) })).replaceAll("<!-- -->", "");
// Isi satu section dari h2 berid `${id}-heading` sampai penutup section; null bila section tidak ada.
const sectionOf = (html: string, id: string) => {
  const start = html.indexOf(`id="${id}-heading"`);
  return start === -1 ? null : html.slice(start, html.indexOf("</section>", start));
};
const links = (html: string, prefix: string) =>
  [...html.matchAll(new RegExp(`href="/${prefix}/([^"]+)"`, "g"))].map((match) => match[1]);

describe("halaman /programs/[slug] (Program 1)", () => {
  it("menampilkan hero dengan nomor resmi, breadcrumb, foto, dan departemen pengelola", async () => {
    const html = await render("mentor-community");

    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>Mentor Community<\/h1>/);
    expect(html).toContain(">Program 01<");
    expect(html).toMatch(/<a[^>]*href="\/programs"[^>]*>Program<\/a>/);
    expect(html).toMatch(/<img[^>]*alt="Mentor Community"/);
    const hero = html.slice(0, html.indexOf("</section>"));
    expect(links(hero, "departments")).toEqual(["competition-handler"]);
  });

  it("menampilkan departemen pengelola dengan nomor resmi, koordinator, dan jumlah pengurus", async () => {
    const section = sectionOf(await render("mentor-community"), "departemen-pengelola");
    expect(section).not.toBeNull();
    expect(section).toContain(">Competition Handler</h3>");
    expect(section).toContain(">04</span>");
    expect(section).toContain(">Michael Rondonuwu<");
    expect(section).toContain(">4 pengurus<");
  });

  it("menaut program lain dari departemen yang sama", async () => {
    const section = sectionOf(await render("mentor-community"), "program-departemen");
    expect(section).toContain("Competition Handler");
    expect(links(section ?? "", "programs")).toEqual(["competition-finder"]);
  });

  it("menaut tiga program lainnya di luar program ini dan departemennya", async () => {
    const slugs = links(sectionOf(await render("mentor-community"), "program-lainnya") ?? "", "programs");
    expect(new Set(slugs).size).toBe(3);
    expect(slugs).not.toContain("mentor-community");
    expect(slugs).not.toContain("competition-finder");
  });

  it("program tanpa departemen pengelola menyembunyikan bagian departemen", async () => {
    const html = await render("kabel");
    expect(sectionOf(html, "departemen-pengelola")).toBeNull();
    expect(sectionOf(html, "program-departemen")).toBeNull();
    expect(links(html, "departments")).toEqual([]);
    const others = links(sectionOf(html, "program-lainnya") ?? "", "programs");
    expect(new Set(others).size).toBe(3);
    expect(others).not.toContain("kabel");
  });

  it("slug yang tidak ada berujung 404", async () => {
    await expect(ProgramDetailPage({ params: Promise.resolve({ slug: "tidak-ada" }) })).rejects.toMatchObject({
      digest: "NEXT_HTTP_ERROR_FALLBACK;404",
    });
  });
});
