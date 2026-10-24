import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { compile } from "tailwindcss";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

async function buildUtilities(candidates: string[]) {
  const compiler = await compile(readFileSync("app/globals.css", "utf8"), {
    base: process.cwd(),
    loadStylesheet: async (id) => {
      const path = require.resolve(id === "tailwindcss" ? "tailwindcss/index.css" : id);
      return { path, base: dirname(path), content: readFileSync(path, "utf8") };
    },
  });
  return compiler.build(candidates);
}

describe("theme tokens", () => {
  it("keeps text-base a font-size utility, not a color", async () => {
    const css = await buildUtilities(["text-base"]);
    const rule = [...css.matchAll(/\.text-base\s*\{[^}]*\}/g)].join("\n");
    expect(rule).toMatch(/font-size:\s*var\(--text-base\)/);
    expect(rule).not.toMatch(/(^|[;{\s])color:/);
  });
});
