import { describe, expect, it } from "vitest";
import {
  redactCredentials,
  resolveDatabaseTarget,
} from "../../scripts/tooling.mjs";

describe("Database target validation and credential security", () => {
  const validRef = "abcedfghijklmnopqrst";
  const validSupabaseUrl = `https://${validRef}.supabase.co`;
  const validPassword = "SuperSecretDbPassword123!";

  it("1. resolves valid verified hosted target via standard config", () => {
    const res = resolveDatabaseTarget({
      projectRef: validRef,
      supabaseUrl: validSupabaseUrl,
      dbPassword: validPassword,
    });

    expect(res.kind).toBe("hosted_verified");
    expect(res.targetRef).toBe(validRef);
    expect(res.isVerifiedHosted).toBe(true);
    expect(res.host).toBe(`db.${validRef}.supabase.co`);
    expect(res.url.hostname).toBe(`db.${validRef}.supabase.co`);
    expect(res.url.searchParams.get("sslmode")).toBe("require");
  });

  it("1b. resolves valid verified hosted target via direct SUPABASE_DB_URL matching project ref", () => {
    const directUrl = `postgresql://postgres:${validPassword}@db.${validRef}.supabase.co:5432/postgres`;
    const res = resolveDatabaseTarget({
      dbUrlString: directUrl,
      projectRef: validRef,
      supabaseUrl: validSupabaseUrl,
    });

    expect(res.kind).toBe("hosted_verified");
    expect(res.targetRef).toBe(validRef);
    expect(res.isVerifiedHosted).toBe(true);
    expect(res.host).toBe(`db.${validRef}.supabase.co`);
  });

  it("2. resolves valid explicitly approved disposable local target", () => {
    const localUrl = "postgresql://postgres:localpass@127.0.0.1:5432/postgres";
    const res = resolveDatabaseTarget({
      dbUrlString: localUrl,
      allowLocalDisposable: true,
    });

    expect(res.kind).toBe("local_disposable");
    expect(res.targetRef).toBe("local_disposable");
    expect(res.isVerifiedHosted).toBe(false);
    expect(res.host).toBe("127.0.0.1");
  });

  it("3. rejects missing target configuration when neither url nor project config provided", () => {
    expect(() =>
      resolveDatabaseTarget({
        dbUrlString: undefined,
        projectRef: undefined,
        supabaseUrl: undefined,
        dbPassword: undefined,
      }),
    ).toThrow(/Missing database target configuration/i);
  });

  it("4. rejects invalid protocol in database URL", () => {
    expect(() =>
      resolveDatabaseTarget({
        dbUrlString: "mysql://postgres:pass@127.0.0.1:3306/db",
      }),
    ).toThrow(/Invalid database protocol/i);

    expect(() =>
      resolveDatabaseTarget({
        dbUrlString: `https://db.${validRef}.supabase.co:5432/postgres`,
      }),
    ).toThrow(/Invalid database protocol/i);
  });

  it("5. rejects project ref mismatch for remote target", () => {
    const mismatchedUrl = `postgresql://postgres:${validPassword}@db.another-project-123.supabase.co:5432/postgres`;
    expect(() =>
      resolveDatabaseTarget({
        dbUrlString: mismatchedUrl,
        projectRef: validRef,
        supabaseUrl: validSupabaseUrl,
      }),
    ).toThrow(/project ref mismatch/i);
  });

  it("6. rejects unexpected remote database host", () => {
    const unexpectedUrl = "postgresql://postgres:secret@arbitrary-remote-host.com:5432/postgres";
    expect(() =>
      resolveDatabaseTarget({
        dbUrlString: unexpectedUrl,
        projectRef: validRef,
        supabaseUrl: validSupabaseUrl,
      }),
    ).toThrow(/Unexpected remote database host/i);
  });

  it("7. redacts credentials, passwords in URLs, and explicit secret tokens", () => {
    const sensitiveString = `Error connecting to postgresql://postgres:${validPassword}@db.${validRef}.supabase.co:5432/postgres with key eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummysecret`;
    const redacted = redactCredentials(sensitiveString, [
      validPassword,
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummysecret",
    ]);

    expect(redacted).not.toContain(validPassword);
    expect(redacted).not.toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummysecret");
    expect(redacted).toContain("[REDACTED]");
    expect(redacted).toContain(`postgresql://postgres:[REDACTED]@db.${validRef}.supabase.co:5432/postgres`);
  });

  it("8. fails safely without opening connection when target cannot be verified", () => {
    expect(() =>
      resolveDatabaseTarget({
        dbUrlString: `postgresql://postgres:${validPassword}@db.${validRef}.supabase.co:5432/postgres`,
        projectRef: validRef,
        supabaseUrl: "https://tampered-url.supabase.co", // Mismatch with ref
      }),
    ).toThrow(/Project URL\/ref mismatch/i);

    expect(() =>
      resolveDatabaseTarget({
        projectRef: validRef,
        supabaseUrl: validSupabaseUrl,
        dbPassword: "", // Missing password
      }),
    ).toThrow(/Missing SUPABASE_DB_PASSWORD/i);
  });
});
