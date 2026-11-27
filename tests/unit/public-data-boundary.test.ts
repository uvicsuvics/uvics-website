import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/** Utang yang tercatat: file UI yang masih mengimpor mock, dengan issue pemiliknya. */
const KNOWN_DEBT: Record<string, string> = {
  "components/sections/EventsSection.tsx": "#51",
  "components/sections/GlanceSection.tsx": "#51",
  "components/sections/JoinCTASection.tsx": "#51",
  "components/sections/NewsSection.tsx": "#51",
  "components/sections/PartnersSection.tsx": "#51",
  "app/(public)/batch/page.tsx": "U09 (#49)",
};

const MOCK_SPECIFIER = /^@\/(?:data|lib\/mock-data)\//;
// Deklarasi import nilai (bukan `import type`), termasuk multi-baris dan side-effect.
const IMPORT_DECLARATION = /import\s+(?!type\s)(?:[^;'"]*?\s*from\s*)?["']([^"']+)["']/g;

/** Mengembalikan specifier mock dari import nilai; `import type` dilewati. */
function findMockImports(source: string): string[] {
  return [...source.matchAll(IMPORT_DECLARATION)]
    .map((match) => match[1])
    .filter((specifier) => MOCK_SPECIFIER.test(specifier));
}

const SERVICE_SPECIFIER = /^@\/lib\/services\//;
const USE_CLIENT = /^\s*(?:\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n\s*)*["']use client["']/;

/** Mengembalikan specifier service dari import nilai; `import type` dilewati. */
function findServiceImports(source: string): string[] {
  return [...source.matchAll(IMPORT_DECLARATION)]
    .map((match) => match[1])
    .filter((specifier) => SERVICE_SPECIFIER.test(specifier));
}

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return listSourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

const uiFiles = ["app", "components"].flatMap(listSourceFiles);
const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("batas data publik", () => {
  it("pencocok import mengenali import nilai, multi-baris, dan melewatkan import type", () => {
    expect(findMockImports('import type { A } from "@/data/mock/about";')).toEqual([]);
    expect(findMockImports('import {\n  UVICS_NEWS,\n} from "@/data/mock/news";')).toEqual([
      "@/data/mock/news",
    ]);
    expect(findMockImports('import { type A, B } from "@/data/mock/about";')).toEqual([
      "@/data/mock/about",
    ]);
    expect(findMockImports('import X from "@/lib/mock-data/competitions";')).toEqual([
      "@/lib/mock-data/competitions",
    ]);
    expect(findMockImports('import { cn } from "@/lib/utils";')).toEqual([]);
  });

  it("pencocok service mengenali import nilai dan melewatkan import type", () => {
    expect(findServiceImports('import type { A } from "@/lib/services/organizationService";')).toEqual([]);
    expect(findServiceImports('import { getX } from "@/lib/services/query";')).toEqual([
      "@/lib/services/query",
    ]);
    expect(findServiceImports('import { cn } from "@/lib/utils";')).toEqual([]);
    expect(USE_CLIENT.test("'use client';\nimport a from 'b';")).toBe(true);
    expect(USE_CLIENT.test('"use client"\n')).toBe(true);
    expect(USE_CLIENT.test("import a from 'b';\n'use client';")).toBe(false);
  });

  it("komponen client tidak mengimpor nilai dari @/lib/services (menarik kode backend ke bundle)", () => {
    const violations = uiFiles.filter(
      (path) => USE_CLIENT.test(read(path)) && findServiceImports(read(path)).length > 0,
    );
    expect(violations).toEqual([]);
  });

  it("UI tidak mengimpor mock selain utang yang tercatat", () => {
    const violations = uiFiles.filter(
      (path) => findMockImports(read(path)).length > 0 && !(path in KNOWN_DEBT),
    );
    expect(violations).toEqual([]);
  });

  it("setiap entri allowlist masih mengimpor mock, supaya entri usang ikut dihapus", () => {
    const stale = Object.keys(KNOWN_DEBT).filter(
      (path) => !existsSync(path) || findMockImports(read(path)).length === 0,
    );
    expect(stale).toEqual([]);
  });

  it("UI tidak mengimpor tipe baris database", () => {
    expect(uiFiles.filter((path) => read(path).includes("@/types/database"))).toEqual([]);
  });

  it("folder mock lama sudah dihapus", () => {
    expect(existsSync("lib/mock-data")).toBe(false);
  });
});
