import { describe, expect, it } from "vitest";
import { checkMigrations } from "../../scripts/check-migrations.mjs";

const base = ["20260922090000_backend_foundation.sql", "20261004080000_content_foundation.sql"];
const dir = "supabase/migrations/";

describe("migration guard (DEVELOPMENT_WORKFLOW §9)", () => {
  it("accepts a new migration ordered after every applied one", () => {
    expect(checkMigrations([{ status: "A", file: `${dir}20261011090000_content_indexes.sql` }], base)).toEqual([]);
  });

  it.each(["M", "D", "T"])("rejects status %s on an applied migration", (status) => {
    expect(checkMigrations([{ status, file: `${dir}${base[0]}` }], base)).toHaveLength(1);
  });

  it("rejects a rename, which git reports as delete plus add", () => {
    const changes = [
      { status: "D", file: `${dir}${base[0]}` },
      { status: "A", file: `${dir}20261011090000_backend_foundation.sql` },
    ];
    expect(checkMigrations(changes, base)).toHaveLength(1);
  });

  it("rejects bad names and timestamps older than the latest applied migration", () => {
    expect(checkMigrations([{ status: "A", file: `${dir}add_table.sql` }], base)).toHaveLength(1);
    expect(checkMigrations([{ status: "A", file: `${dir}20261001000000_backdated.sql` }], base)).toHaveLength(1);
  });

  it("ignores files outside the migration directory", () => {
    expect(checkMigrations([{ status: "M", file: "supabase/config.toml" }], base)).toEqual([]);
  });
});
