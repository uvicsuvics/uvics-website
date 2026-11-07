import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { prerenderToNodeStream } from "react-dom/static";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Users } from "lucide-react";
import DashboardPage from "@/app/admin/(protected)/dashboard/page";
import { DashboardKpiCard } from "@/components/admin/dashboard/DashboardKpiCard";
import {
  DashboardAuditActivity,
  DashboardRecentAchievements,
  DashboardRecentRegistrations,
} from "@/components/admin/dashboard/DashboardRecentLists";
import { DashboardStatCard } from "@/components/admin/dashboard/DashboardStatCard";
import {
  countMembers,
  countOpenCompetitions,
  countPendingRegistrations,
  listRecentAchievements,
  listRecentAuditActivity,
  listRecentRegistrations,
  type AuditActivityRow,
  type RecentAchievementRow,
  type RecentRegistrationRow,
} from "@/lib/backend/dashboard";
import { AppError } from "@/lib/backend/errors";
import { formatDateTime } from "@/lib/format/date";
import type { Database } from "@/types/database";

type Call = [string, unknown[]];
type Result = { data?: unknown; count?: number | null; error: { code?: string; message?: string } | null };

const page = vi.hoisted(() => ({ client: null as unknown }));
vi.mock("@/lib/auth/page", () => ({
  requirePageAdmin: async () => ({ id: "admin-1", name: "Dion Kobi", sessionId: "s-1" }),
}));
vi.mock("@/lib/supabase/server", () => ({ serverClient: async () => page.client }));

/** Client palsu: setiap `from()` mencatat rantai panggilannya, hasil ditentukan `respond`. */
function fakeClient(respond: (table: string, calls: Call[]) => Result) {
  const queries: { table: string; calls: Call[] }[] = [];
  const client = {
    from(table: string) {
      const query = { table, calls: [] as Call[] };
      queries.push(query);
      const chain: Record<string, unknown> = {
        then: (resolve: (value: Result) => unknown, reject: (reason: unknown) => unknown) =>
          Promise.resolve()
            .then(() => respond(table, query.calls))
            .then(resolve, reject),
      };
      for (const method of ["select", "eq", "is", "in", "order", "limit"]) {
        chain[method] = (...args: unknown[]) => {
          query.calls.push([method, args]);
          return chain;
        };
      }
      return chain;
    },
  };
  return { client: client as unknown as SupabaseClient<Database>, queries };
}

const ACTIVITY: AuditActivityRow[] = [
  {
    id: "a1",
    action: "REGISTRATION_REVIEWED",
    entity_type: "registration",
    created_at: "2026-11-08T06:30:00Z",
    actor: { name: "Dion Kobi" },
  },
  {
    id: "a2",
    action: "COMPETITION_CREATED",
    entity_type: "competition",
    created_at: "2026-11-07T23:05:00Z",
    actor: null,
  },
];

describe("query dashboard admin", () => {
  it("menghitung anggota per status tanpa baris terhapus, hanya head count", async () => {
    const { client, queries } = fakeClient(() => ({ count: 12, error: null }));
    await expect(countMembers(client, "ALUMNI")).resolves.toBe(12);
    expect(queries).toEqual([
      {
        table: "members",
        calls: [
          ["select", ["id", { count: "exact", head: true }]],
          ["eq", ["status", "ALUMNI"]],
          ["is", ["deleted_at", null]],
        ],
      },
    ]);
  });

  it("error database menjadi AppError aman", async () => {
    const { client } = fakeClient(() => ({ count: null, error: { code: "XX000", message: "relation leak" } }));
    const failure = countMembers(client, "ACTIVE");
    await expect(failure).rejects.toBeInstanceOf(AppError);
    await expect(failure).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  });

  it("aktivitas terbaru hanya memilih kolom aman dan nama admin, urut terbaru, maksimal 5", async () => {
    const { client, queries } = fakeClient(() => ({ data: ACTIVITY, error: null }));
    await expect(listRecentAuditActivity(client)).resolves.toEqual(ACTIVITY);
    expect(queries[0].table).toBe("audit_logs");
    expect(queries[0].calls).toEqual([
      ["select", ["id,action,entity_type,created_at,actor:admins(name)"]],
      ["order", ["created_at", { ascending: false }]],
      ["order", ["id", { ascending: false }]],
      ["limit", [5]],
    ]);
  });

  it("K1: pendaftaran menunggu = SUBMITTED dan UNDER_REVIEW", async () => {
    const { client, queries } = fakeClient(() => ({ count: 3, error: null }));
    await expect(countPendingRegistrations(client)).resolves.toBe(3);
    expect(queries[0]).toEqual({
      table: "registrations",
      calls: [
        ["select", ["id", { count: "exact", head: true }]],
        ["in", ["status", ["SUBMITTED", "UNDER_REVIEW"]]],
      ],
    });
  });

  it("K2: kompetisi dibuka = OPEN dan PUBLISHED, sama dengan grup di /competitions", async () => {
    const { client, queries } = fakeClient(() => ({ count: 2, error: null }));
    await expect(countOpenCompetitions(client)).resolves.toBe(2);
    expect(queries[0]).toEqual({
      table: "competitions",
      calls: [
        ["select", ["id", { count: "exact", head: true }]],
        ["eq", ["status", "OPEN"]],
        ["eq", ["publication_status", "PUBLISHED"]],
      ],
    });
  });

  it("K3: pendaftaran terbaru tanpa NIM dan kontak", async () => {
    const { client, queries } = fakeClient(() => ({ data: [], error: null }));
    await expect(listRecentRegistrations(client)).resolves.toEqual([]);
    expect(queries[0]).toEqual({
      table: "registrations",
      calls: [
        ["select", ["id,full_name,status,submitted_at"]],
        ["order", ["created_at", { ascending: false }]],
        ["order", ["id", { ascending: false }]],
        ["limit", [5]],
      ],
    });
  });

  it("K3: prestasi terbaru menurut tanggal prestasi", async () => {
    const { client, queries } = fakeClient(() => ({ data: [], error: null }));
    await expect(listRecentAchievements(client)).resolves.toEqual([]);
    expect(queries[0]).toEqual({
      table: "achievements",
      calls: [
        ["select", ["id,title,ranking,achievement_date,publication_status"]],
        ["order", ["achievement_date", { ascending: false }]],
        ["order", ["id", { ascending: false }]],
        ["limit", [5]],
      ],
    });
  });
});

describe("formatDateTime", () => {
  it("menampilkan timestamptz dalam WITA, tidak bergantung zona runtime", () => {
    expect(formatDateTime("2026-11-08T06:30:00Z")).toBe("8 Nov 2026, 14.30 WITA");
    expect(formatDateTime("2026-11-07T23:05:00+00:00")).toBe("8 Nov 2026, 07.05 WITA");
  });
});

const card = { title: "Anggota Aktif", description: "Total anggota aktif", icon: Users };
const render = (element: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(element);

/** Render penuh yang menunggu async component dan Suspense (renderToStaticMarkup hanya merender fallback). */
async function renderAsync(element: Parameters<typeof prerenderToNodeStream>[0]) {
  const { prelude } = await prerenderToNodeStream(element);
  let html = "";
  for await (const chunk of prelude) html += chunk;
  return html;
}

describe("kartu KPI", () => {
  it("menampilkan angka nyata, termasuk 0 yang benar-benar nol", () => {
    expect(render(createElement(DashboardStatCard, { ...card, value: 0 }))).toContain(">0</div>");
  });

  it("sumber belum ada: 'Belum tersedia', bukan 0", () => {
    const html = render(createElement(DashboardStatCard, { ...card, value: null, description: "Modul berita belum dibangun." }));
    expect(html).toContain("Belum tersedia");
    expect(html).toContain("Modul berita belum dibangun.");
    expect(html).not.toMatch(/>0</);
  });

  it("memuat angka dari load()", async () => {
    const html = render(await DashboardKpiCard({ ...card, load: async () => 7 }));
    expect(html).toContain(">7</div>");
    expect(html).not.toContain('role="alert"');
  });

  it("query gagal: hanya kartu itu yang gagal, dengan pesan aman", async () => {
    const html = render(
      await DashboardKpiCard({
        ...card,
        load: async () => {
          throw new Error("password authentication failed for user postgres");
        },
      }),
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain("Gagal dimuat");
    expect(html).toContain(new AppError("INTERNAL_ERROR").message);
    expect(html).not.toContain("postgres");
    expect(html).not.toMatch(/>0</);
  });
});

describe("widget aktivitas admin", () => {
  it("menampilkan aksi berlabel, nama admin, dan waktu WITA tanpa payload", async () => {
    const html = await renderAsync(createElement(DashboardAuditActivity, { load: async () => ACTIVITY }));
    expect(html).toContain("Meninjau pendaftaran");
    expect(html).toContain("Dion Kobi");
    expect(html).toContain('dateTime="2026-11-08T06:30:00Z"');
    expect(html).toContain("8 Nov 2026, 14.30 WITA");
    // Aksi baru tanpa label tetap terbaca lewat kodenya; admin terhapus tidak memunculkan null.
    expect(html).toContain("COMPETITION_CREATED");
    expect(html).toContain("Admin tidak dikenal");
    expect(html).not.toMatch(/null|undefined/);
  });

  it("tanpa aktivitas: empty state", async () => {
    const html = await renderAsync(createElement(DashboardAuditActivity, { load: async () => [] }));
    expect(html).toContain("Belum ada aktivitas admin terbaru.");
  });

  it("gagal dimuat: error state aman", async () => {
    const html = await renderAsync(
      createElement(DashboardAuditActivity, {
        load: async () => {
          throw new AppError("SERVICE_UNAVAILABLE");
        },
      }),
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain(new AppError("SERVICE_UNAVAILABLE").message);
  });
});

const REGISTRATIONS: RecentRegistrationRow[] = [
  { id: "r1", full_name: "Maria Tumbel", status: "UNDER_REVIEW", submitted_at: "2026-11-08T01:00:00Z" },
];
const ACHIEVEMENTS: RecentAchievementRow[] = [
  {
    id: "p1",
    title: "Juara 1 Hackathon Sulut",
    ranking: "Juara 1",
    achievement_date: "2026-10-05",
    publication_status: "DRAFT",
  },
];

describe("widget pendaftaran dan prestasi terbaru", () => {
  it("pendaftaran: nama, label status, waktu WITA", async () => {
    const html = await renderAsync(createElement(DashboardRecentRegistrations, { load: async () => REGISTRATIONS }));
    expect(html).toContain("Maria Tumbel");
    expect(html).toContain("Sedang ditinjau");
    expect(html).toContain("8 Nov 2026, 09.00 WITA");
  });

  it("pendaftaran kosong dan gagal punya state sendiri", async () => {
    expect(await renderAsync(createElement(DashboardRecentRegistrations, { load: async () => [] }))).toContain(
      "Belum ada pendaftaran terbaru.",
    );
    const failed = await renderAsync(
      createElement(DashboardRecentRegistrations, {
        load: async () => {
          throw new AppError("FORBIDDEN");
        },
      }),
    );
    expect(failed).toContain('role="alert"');
    expect(failed).toContain(new AppError("FORBIDDEN").message);
  });

  it("prestasi: judul, peringkat, status publikasi, tanggal", async () => {
    const html = await renderAsync(createElement(DashboardRecentAchievements, { load: async () => ACHIEVEMENTS }));
    expect(html).toContain("Juara 1 Hackathon Sulut");
    expect(html).toContain("Juara 1 · Draf");
    expect(html).toContain("5 Okt 2026");
  });
});

const renderPage = async () => renderAsync(await DashboardPage());

const counts: Record<string, number> = { members: 12, registrations: 3, competitions: 2 };

/** Isi kartu KPI dengan judul tertentu, untuk memeriksa nilai per kartu. */
const cardOf = (html: string, title: string) => {
  const start = html.indexOf(`>${title}</span>`);
  return html.slice(start, html.indexOf("</p></div></div>", start));
};

describe("halaman dashboard admin", () => {
  beforeEach(() => {
    page.client = fakeClient((table, calls) => {
      if (calls[0][1][1]) return { count: table === "members" && calls[1][1][1] === "ALUMNI" ? 4 : counts[table], error: null };
      return { data: table === "audit_logs" ? ACTIVITY : table === "registrations" ? REGISTRATIONS : ACHIEVEMENTS, error: null };
    }).client;
  });

  it("KPI membaca data nyata; berita dan event belum tersedia, bukan 0", async () => {
    const html = await renderPage();
    expect(cardOf(html, "Anggota Aktif")).toContain(">12</div>");
    expect(cardOf(html, "Alumni")).toContain(">4</div>");
    expect(cardOf(html, "Pendaftaran Menunggu")).toContain(">3</div>");
    expect(cardOf(html, "Kompetisi Dibuka")).toContain(">2</div>");
    for (const title of ["Berita Terbit", "Event Mendatang"]) {
      expect(cardOf(html, title)).toContain("Belum tersedia");
      expect(cardOf(html, title)).not.toMatch(/>0</);
    }
    expect(html).toContain("Maria Tumbel");
    expect(html).toContain("Juara 1 Hackathon Sulut");
    expect(html).toContain("Meninjau pendaftaran");
    expect(html).toContain("Modul event belum tersedia.");
    expect(html).toContain("Modul berita belum tersedia.");
    expect(html).not.toContain('role="alert"');
  });

  it("satu query gagal hanya menjatuhkan widgetnya", async () => {
    page.client = fakeClient((table, calls) => {
      if (table === "competitions") return { count: null, error: { code: "XX000", message: "boom" } };
      if (calls[0][1][1]) return { count: 5, error: null };
      return { data: [], error: null };
    }).client;
    const html = await renderPage();
    expect(cardOf(html, "Kompetisi Dibuka")).toContain("Gagal dimuat");
    expect(cardOf(html, "Anggota Aktif")).toContain(">5</div>");
    expect(html.match(/role="alert"/g)).toHaveLength(1);
    expect(html).not.toContain("boom");
  });
});
