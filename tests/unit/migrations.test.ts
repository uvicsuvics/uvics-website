import { expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
const { psql, readFileSync } = vi.hoisted(() => ({
  psql: vi.fn(),
  readFileSync: vi.fn(),
}));
vi.mock("node:fs", () => ({
  readFileSync,
  readdirSync: () => ["20260922090000_fixture.sql"],
}));
vi.mock("../../scripts/tooling.mjs", () => ({
  psql,
  target: () => "fixture-project",
}));
it("applies the same migration checksum for Windows CRLF and canonical LF checkout", async () => {
  const argv = process.argv;
  const output = vi.spyOn(console, "log").mockImplementation(() => {});
  try {
    process.argv = ["node", "migrate.mjs", "fixture-project"];
    const lf = "select 1;\nselect 2;\n";
    const digest = createHash("sha256").update(lf).digest("hex");
    for (const source of [lf, lf.replaceAll("\n", "\r\n")]) {
      vi.resetModules();
      psql.mockClear();
      readFileSync.mockReturnValue(source);
      await import("../../scripts/migrate.mjs");
      expect(psql.mock.calls[0][0]).toContain(digest);
      expect(psql.mock.calls[0][0]).not.toContain("\r");
    }
  } finally {
    process.argv = argv;
    output.mockRestore();
  }
});
