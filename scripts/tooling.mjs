import nextEnv from "@next/env";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
nextEnv.loadEnvConfig(process.cwd());
export function required(name) {
  const v = process.env[name];
  if (!v) throw Error(`Missing ${name}`);
  return v;
}
export function target() {
  const ref = required("SUPABASE_PROJECT_REF");
  const url = new URL(required("NEXT_PUBLIC_SUPABASE_URL"));
  if (url.hostname !== `${ref}.supabase.co`)
    throw Error("Project URL/ref mismatch");
  return ref;
}
export function operatorClient() {
  return createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    process.env.SUPABASE_SECRET_KEY || required("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export function psql(sql) {
  const defaultWinPsql =
    [
      "C:/Program Files/PostgreSQL/18/bin/psql.exe",
      "C:/Program Files/PostgreSQL/17/bin/psql.exe",
    ].find((p) => {
      try {
        return existsSync(p);
      } catch {
        return false;
      }
    }) || "C:/Program Files/PostgreSQL/17/bin/psql.exe";
  const binary =
    process.env.PSQL_BIN ||
    (process.platform === "win32"
      ? defaultWinPsql
      : "psql");
  const r = spawnSync(
    binary,
    ["-X", "--no-password", "-v", "ON_ERROR_STOP=1", "-At"],
    {
      input: sql,
      encoding: "utf8",
      windowsHide: true,
      timeout: 60000,
      env: {
        ...process.env,
        PGHOST: `db.${target()}.supabase.co`,
        PGPORT: "5432",
        PGDATABASE: "postgres",
        PGUSER: "postgres",
        PGPASSWORD: required("SUPABASE_DB_PASSWORD"),
        PGSSLMODE: "require",
        PGCONNECT_TIMEOUT: "10",
      },
    },
  );
  if (r.status !== 0) {
    const code =
      r.stderr.match(/ERROR:\s+([^\r\n]+)/)?.[1] ||
      "PostgreSQL operation failed";
    throw Error(code);
  }
  return r.stdout;
}

export function redactCredentials(str, extraSecrets = []) {
  if (typeof str !== "string") str = String(str ?? "");
  let result = str.replace(/(:\/\/[^:]+:)[^@]+(@)/g, "$1[REDACTED]$2");
  for (const s of extraSecrets) {
    if (s && typeof s === "string" && s.length > 2) {
      result = result.split(s).join("[REDACTED]");
      try {
        const encoded = encodeURIComponent(s);
        if (encoded !== s) {
          result = result.split(encoded).join("[REDACTED]");
        }
      } catch {}
    }
  }
  return result;
}

export function resolveDatabaseTarget(options = {}) {
  const {
    dbUrlString = process.env.SUPABASE_DB_URL,
    poolerHost = process.env.SUPABASE_DB_POOLER_HOST,
    projectRef = process.env.SUPABASE_PROJECT_REF,
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
    dbPassword = process.env.SUPABASE_DB_PASSWORD,
    allowLocalDisposable = true,
  } = options;

  if (dbUrlString) {
    let parsed;
    try {
      parsed = new URL(dbUrlString);
    } catch {
      throw Error("Invalid database URL format");
    }

    if (!["postgresql:", "postgres:"].includes(parsed.protocol)) {
      throw Error(`Invalid database protocol: ${parsed.protocol}; expected postgresql: or postgres:`);
    }

    if (["127.0.0.1", "localhost"].includes(parsed.hostname)) {
      if (!allowLocalDisposable) {
        throw Error("Local disposable database target is not permitted in this context");
      }
      return {
        kind: "local_disposable",
        url: parsed,
        host: parsed.hostname,
        port: parsed.port || "5432",
        targetRef: "local_disposable",
        isVerifiedHosted: false,
      };
    }

    if (!projectRef || !supabaseUrl) {
      throw Error("Cannot verify remote database target: missing SUPABASE_PROJECT_REF or NEXT_PUBLIC_SUPABASE_URL");
    }

    let expectedUrl;
    try {
      expectedUrl = new URL(supabaseUrl);
    } catch {
      throw Error("Invalid NEXT_PUBLIC_SUPABASE_URL format");
    }

    if (expectedUrl.hostname !== `${projectRef}.supabase.co`) {
      throw Error(`Project URL/ref mismatch: URL host ${expectedUrl.hostname} does not match ref ${projectRef}`);
    }

    const isDirectHost = parsed.hostname === `db.${projectRef}.supabase.co`;
    const isPoolerHost =
      (poolerHost && parsed.hostname === poolerHost && /^[a-z0-9-]+\.pooler\.supabase\.com$/.test(poolerHost)) ||
      (parsed.hostname.endsWith(".pooler.supabase.com") && parsed.username === `postgres.${projectRef}`);

    if (!isDirectHost && !isPoolerHost) {
      if (/^db\.[a-z0-9-]+\.supabase\.co$/.test(parsed.hostname) || parsed.hostname.endsWith(".supabase.co")) {
        throw Error(`Database target project ref mismatch: host ${parsed.hostname} does not match verified project ${projectRef}`);
      }
      throw Error(`Unexpected remote database host: ${parsed.hostname}; only verified Supabase project targets are permitted`);
    }

    return {
      kind: "hosted_verified",
      url: parsed,
      host: parsed.hostname,
      port: parsed.port || "5432",
      targetRef: projectRef,
      isVerifiedHosted: true,
    };
  }

  if (!projectRef || !supabaseUrl) {
    throw Error("Missing database target configuration: SUPABASE_PROJECT_REF or NEXT_PUBLIC_SUPABASE_URL not provided");
  }

  let expectedUrl;
  try {
    expectedUrl = new URL(supabaseUrl);
  } catch {
    throw Error("Invalid NEXT_PUBLIC_SUPABASE_URL format");
  }

  if (expectedUrl.hostname !== `${projectRef}.supabase.co`) {
    throw Error(`Project URL/ref mismatch: URL host ${expectedUrl.hostname} does not match ref ${projectRef}`);
  }

  if (!dbPassword) {
    throw Error("Missing SUPABASE_DB_PASSWORD for verified database target");
  }

  if (poolerHost && !/^[a-z0-9-]+\.pooler\.supabase\.com$/.test(poolerHost)) {
    throw Error("Invalid official pooler host");
  }

  const constructed = new URL(
    `postgresql://${poolerHost ? "postgres." + projectRef : "postgres"}@${poolerHost || "db." + projectRef + ".supabase.co"}:5432/postgres`,
  );
  constructed.password = dbPassword;
  constructed.searchParams.set("sslmode", "require");

  return {
    kind: "hosted_verified",
    url: constructed,
    host: constructed.hostname,
    port: "5432",
    targetRef: projectRef,
    isVerifiedHosted: true,
  };
}
