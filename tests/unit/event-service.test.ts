import { describe, expect, it } from "vitest";
import { UVICS_EVENTS } from "@/data/mock/events";
import { getEventBoard, getEventBySlug, getRelatedEvents } from "@/lib/services/eventService";

const time = (iso: string) => Date.parse(iso);

describe("eventService", () => {
  it("mengembalikan DTO PublicEvent tanpa field tampilan lama", async () => {
    const { upcoming } = await getEventBoard();
    expect(Object.keys(upcoming[0]).sort()).toEqual([
      "description",
      "endAt",
      "featured",
      "id",
      "location",
      "poster",
      "registrationUrl",
      "slug",
      "startAt",
      "status",
      "title",
    ]);
  });

  it("membagi event mendatang (naik) dan lampau (turun) menurut status", async () => {
    const { upcoming, past } = await getEventBoard();
    expect(upcoming.length).toBeGreaterThan(0);
    expect(upcoming.every((e) => e.status === "UPCOMING" || e.status === "ONGOING")).toBe(true);
    expect(upcoming.map((e) => time(e.startAt))).toEqual(upcoming.map((e) => time(e.startAt)).sort((a, b) => a - b));
    expect(past.items.length).toBeGreaterThan(0);
    expect(past.items.every((e) => e.status === "FINISHED" || e.status === "CANCELLED")).toBe(true);
    expect(past.items.map((e) => time(e.startAt))).toEqual(past.items.map((e) => time(e.startAt)).sort((a, b) => b - a));
    expect(upcoming.length + past.pagination.total_items).toBe(UVICS_EVENTS.length);
  });

  it("memotong event lampau 9 per halaman dan 404 di luar total", async () => {
    const { past } = await getEventBoard({ page: 1 });
    expect(past.pagination.page_size).toBe(9);
    await expect(getEventBoard({ page: past.pagination.total_pages + 1 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("setiap slug yang ditaut beranda resolve, slug tak dikenal null", async () => {
    for (const { slug } of UVICS_EVENTS) expect((await getEventBySlug(slug))?.slug).toBe(slug);
    expect(await getEventBySlug("tidak-ada")).toBeNull();
  });

  it("event terkait: tanpa dirinya sendiri, maksimal 3, mendatang dulu", async () => {
    const slug = UVICS_EVENTS[0].slug;
    const related = await getRelatedEvents(slug);
    expect(related.length).toBeLessThanOrEqual(3);
    expect(related.map((e) => e.slug)).not.toContain(slug);
    expect(related[0].status).toBe("UPCOMING");
    expect(await getRelatedEvents("tidak-ada")).toEqual([]);
  });
});
