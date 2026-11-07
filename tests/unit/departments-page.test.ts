import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import DepartmentsPage from "@/app/(public)/departments/page";
import { getDepartments } from "@/lib/services/departmentService";
import { getActivePeriod, getPeriodMembers } from "@/lib/services/organizationService";

const render = async () => renderToStaticMarkup(await DepartmentsPage()).replaceAll("<!-- -->", "");

describe("halaman /departments (indeks editorial)", () => {
  it("merangkum jumlah departemen, pengurus departemen, dan periode aktif di hero", async () => {
    const html = await render();
    const period = (await getActivePeriod())!;
    const departmentNames = (await getDepartments()).map((d) => d.name);
    const departmentMembers = (await getPeriodMembers(period.id)).filter((m) =>
      departmentNames.includes(m.department ?? ""),
    ).length;

    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(new RegExp(`<dt[^>]*>Departemen</dt><dd[^>]*>${departmentNames.length}</dd>`));
    expect(html).toMatch(new RegExp(`<dt[^>]*>Pengurus departemen</dt><dd[^>]*>${departmentMembers}</dd>`));
    expect(html).toMatch(new RegExp(`<dt[^>]*>Periode aktif</dt><dd[^>]*>${period.name}</dd>`));
  });

  it("menomori departemen sesuai urutan resmi dengan koordinator, jumlah pengurus, dan tautan detail", async () => {
    const html = await render();
    const period = (await getActivePeriod())!;
    const members = await getPeriodMembers(period.id);
    let previous = -1;

    for (const [index, department] of (await getDepartments()).entries()) {
      const start = html.indexOf(`>${department.name}</h3>`);
      expect(start).toBeGreaterThan(previous);
      previous = start;

      const row = html.slice(html.lastIndexOf("<li", start), html.indexOf("</li>", start));
      const own = members.filter((m) => m.department === department.name);
      const coordinator = own.find((m) => m.position === "Koordinator")!;
      expect(row).toContain(`>${String(index + 1).padStart(2, "0")}</span>`);
      expect(row).toContain(`>${coordinator.name}<`);
      expect(row).toContain(`>${own.length} pengurus<`);
      expect(row).toMatch(
        new RegExp(`<a(?=[^>]*href="/departments/${department.slug}")(?=[^>]*aria-label="Lihat departemen ${department.name}")`),
      );
    }
  });
});
