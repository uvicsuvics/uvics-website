import { describe, expect, it } from "vitest";
import { compareSchema, readTypes } from "../../scripts/schema-types.mjs";

const source = `
export type Json = string;
export type Database = {
  public: {
    Tables: {
      items: {
        Row: { id: string; kind: Database["public"]["Enums"]["kind"]; note: string | null; owner_id: string };
        Insert: { id?: string; kind: Database["public"]["Enums"]["kind"]; note?: string | null; owner_id: string };
        Update: { id?: string; kind?: Database["public"]["Enums"]["kind"]; note?: string | null; owner_id?: string };
        Relationships: [
          { foreignKeyName: "items_owner_id_fkey"; columns: ["owner_id"]; isOneToOne: false; referencedRelation: "owners"; referencedColumns: ["id"] },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { ping: { Args: { p_id: string }; Returns: boolean } };
    Enums: { kind: "A" | "B" };
    CompositeTypes: { [_ in never]: never };
  };
};`;

const catalog = () => ({
  columns: [
    { table_name: "items", column_name: "id", nullable: false, has_default: true, data_type: "uuid", udt_name: "uuid" },
    { table_name: "items", column_name: "kind", nullable: false, has_default: false, data_type: "USER-DEFINED", udt_name: "kind" },
    { table_name: "items", column_name: "note", nullable: true, has_default: false, data_type: "text", udt_name: "text" },
    { table_name: "items", column_name: "owner_id", nullable: false, has_default: false, data_type: "uuid", udt_name: "uuid" },
  ],
  relationships: [{ conname: "items_owner_id_fkey", tbl: "items", ref: "owners", cols: ["owner_id"], refcols: ["id"], one: false }],
  functions: [{ proname: "ping", res: "boolean", args: "p_id:uuid" }],
  enums: [{ typname: "kind", labels: ["A", "B"] }],
});

describe("schema vs types/database.ts", () => {
  it("reports no difference when types mirror the catalog", () => {
    expect(compareSchema(catalog(), readTypes(source))).toEqual([]);
  });

  it("detects nullability, Insert optionality, missing columns, enums, functions and relationships", () => {
    const db = catalog();
    db.columns[2].nullable = false;
    db.columns[3].has_default = true;
    db.columns.push({ table_name: "items", column_name: "extra", nullable: true, has_default: false, data_type: "text", udt_name: "text" });
    db.enums[0].labels = ["A", "B", "C"];
    db.functions[0].res = "void";
    db.relationships[0].one = true;
    const diffs = compareSchema(db, readTypes(source));
    for (const fragment of ["items.note Row", "items.owner_id Insert: optional", "items.extra: only in db", "enum kind", "function ping returns", "items relationships"])
      expect(diffs.some((d) => d.includes(fragment))).toBe(true);
  });
});
