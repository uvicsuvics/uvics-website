import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import EventsPage from "@/app/(public)/events/(list)/page";
import EventDetailPage from "@/app/(public)/events/[slug]/page";
import { EventDetailHeader } from "@/components/events/EventDetailHeader";
import { EventTimelineRow } from "@/components/events/EventTimeline";
import { UVICS_EVENTS } from "@/data/mock/events";
import { getEventBoard } from "@/lib/services/eventService";
import { paginate } from "@/lib/services/query";
import type { PublicEvent } from "@/types/event";

vi.mock("@/lib/services/eventService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/services/eventService")>();
  return { ...actual, getEventBoard: vi.fn(actual.getEventBoard) };
});

const strip = (html: string) => html.replaceAll("<!-- -->", "");
const renderList = async (params: Record<string, string> = {}) =>
  strip(renderToStaticMarkup(await EventsPage({ searchParams: Promise.resolve(params) })));
const renderDetail = async (slug: string) =>
  strip(renderToStaticMarkup(await EventDetailPage({ params: Promise.resolve({ slug }) })));

const fixture: PublicEvent = {
  id: "x",
  slug: "x",
  title: "Judul X",
  description: "Deskripsi X",
  location: null,
  startAt: "2026-11-21T14:00:00+08:00",
  endAt: null,
  registrationUrl: null,
  poster: null,
  status: "UPCOMING",
  featured: false,
};

describe("halaman /events (Konsep A)", () => {
  it("menampilkan event mendatang lalu yang sudah berlangsung, dengan satu h1", async () => {
    const html = await renderList();
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    const upcoming = html.indexOf(">Akan datang</h2>");
    const past = html.indexOf(">Sudah berlangsung</h2>");
    expect(upcoming).toBeGreaterThan(-1);
    expect(past).toBeGreaterThan(upcoming);
    for (const { slug, status } of UVICS_EVENTS) {
      const at = html.lastIndexOf(`href="/events/${slug}"`);
      expect(at).toBeGreaterThan(-1);
      expect(at > past).toBe(status === "FINISHED" || status === "CANCELLED");
    }
  });

  it("menyorot event terdekat di hero", async () => {
    const html = await renderList();
    const hero = html.slice(0, html.indexOf(">Akan datang</h2>"));
    expect(hero).toContain("Event terdekat");
    expect(hero).toContain('href="/events/contoh-webinar-uvics-vibes"');
  });

  it("menampilkan empty state spesifikasi §23 dan menyembunyikan section lampau bila kosong", async () => {
    vi.mocked(getEventBoard).mockResolvedValueOnce({ upcoming: [], past: paginate([], 1, 9) });
    const html = await renderList();
    expect(html).toContain("Belum ada event mendatang.");
    expect(html).not.toContain("Sudah berlangsung");
    expect(html).not.toContain("Event terdekat");
  });

  it("parameter rusak jatuh ke halaman 1, halaman di luar total menjadi 404", async () => {
    await expect(renderList({ page: "abc" })).resolves.toContain(">Akan datang</h2>");
    await expect(renderList({ page: "99" })).rejects.toMatchObject({ digest: expect.stringContaining("404") });
  });

  it("tautan pagination lampau menuju anchor section lampau", async () => {
    const past = Array.from({ length: 12 }, (_, i) => ({ ...fixture, id: `p${i}`, slug: `p${i}`, status: "FINISHED" as const }));
    vi.mocked(getEventBoard).mockResolvedValueOnce({ upcoming: [], past: paginate(past, 1, 9) });
    const html = await renderList();
    expect(html).toContain('href="/events?page=2#event-lampau"');
  });
});

describe("halaman /events/[slug] (Konsep A)", () => {
  it("menampilkan header, jadwal WITA, deskripsi, dan event lainnya", async () => {
    const event = UVICS_EVENTS[0];
    const html = await renderDetail(event.slug);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain(`>${event.title}</h1>`);
    expect(html).toContain(event.timeRange);
    expect(html).toContain(event.location);
    expect(html).toContain(">Tentang event</h2>");
    expect(html).toContain(">Event lainnya</h2>");
    expect(html).toContain('href="/events/contoh-sesi-belajar-kabel"');
    // Deskripsi dipecah per paragraf, bukan satu blok dengan baris baru mentah.
    expect(html.match(/<p[^>]*>Ini konten contoh/g)).toHaveLength(1);
  });

  it("slug tidak dikenal menjadi 404", async () => {
    await expect(renderDetail("tidak-ada")).rejects.toMatchObject({ digest: expect.stringContaining("404") });
  });

  it("header dan baris aman untuk field nullable", () => {
    const html = [
      renderToStaticMarkup(createElement(EventDetailHeader, { event: fixture })),
      renderToStaticMarkup(createElement(EventTimelineRow, { event: fixture })),
    ].join("");
    expect(html).not.toMatch(/undefined|>null<|Invalid Date/);
    expect(html).not.toContain("<img");
    expect(html).not.toContain("Daftar sekarang");
    expect(html).toContain("14.00 WITA");
  });

  it("tombol daftar hanya untuk event yang belum selesai dan punya tautan", () => {
    const withUrl = { ...fixture, registrationUrl: "https://contoh.test/daftar" };
    const open = renderToStaticMarkup(createElement(EventDetailHeader, { event: withUrl }));
    expect(open).toContain('href="https://contoh.test/daftar" target="_blank" rel="noopener noreferrer"');
    expect(open).toContain("Daftar sekarang");
    const finished = renderToStaticMarkup(createElement(EventDetailHeader, { event: { ...withUrl, status: "FINISHED" } }));
    expect(finished).not.toContain("Daftar sekarang");
  });
});
