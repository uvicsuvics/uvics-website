import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { operatorClient, required, target, psql } from "./tooling.mjs";
if (process.argv[2] !== target())
  throw Error("Pass verified project ref explicitly.");
mkdirSync(".runtime", { recursive: true });
const path = ".runtime/auth-fixtures.json";
const credentialsPath = ".runtime/auth-credentials.json";
const run = existsSync(path)
  ? JSON.parse(readFileSync(path, "utf8"))
  : { run: randomUUID(), users: [] };
if (run.retired_at)
  throw Error(
    "Fixture run retired. Archive its identity/credential files before starting a new recorded run; do not reactivate old fixtures.",
  );
if (existsSync(credentialsPath)) {
  const secrets = JSON.parse(readFileSync(credentialsPath, "utf8"));
  run.users = run.users.map((user) => ({
    ...user,
    password: secrets.users.find((item) => item.id === user.id)?.password,
  }));
}
function persist() {
  writeFileSync(
    credentialsPath,
    JSON.stringify(
      { users: run.users.map(({ id, password }) => ({ id, password })) },
      null,
      2,
    ),
  );
  writeFileSync(
    path,
    JSON.stringify(
      {
        ...run,
        users: run.users.map(({ id, label, email }) => ({ id, label, email })),
      },
      null,
      2,
    ),
  );
}
persist();
const operator = operatorClient();
const options = { auth: { persistSession: false, autoRefreshToken: false } };
function userClient() {
  return createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    options,
  );
}
for (const label of ["admin", "other-admin", "nonadmin"]) {
  if (run.users.some((u) => u.label === label)) continue;
  const account = {
    label,
    email: `uvics-${label}-${run.run}@example.invalid`,
    password: randomBytes(24).toString("base64url"),
  };
  const { data, error } = await operator.auth.admin.createUser({
    ...account,
    email_confirm: true,
  });
  if (error || !data.user) throw Error(`Fixture creation failed: ${label}`);
  run.users.push({ ...account, id: data.user.id });
  persist();
  if (label !== "nonadmin") {
    const { error } = await operator.from("admins").insert({
      id: data.user.id,
      name: `Synthetic ${label}`,
      is_active: true,
    });
    if (error) throw Error("Fixture profile creation failed");
  }
}
const fixture = run.users.find((u) => u.label === "admin");
const nonadmin = run.users.find((u) => u.label === "nonadmin");
const a = userClient(),
  b = userClient(),
  c = userClient();
async function login(client, account) {
  const { error } = await client.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  assert.equal(!!error, false, "fixture login");
}
await login(a, fixture);
await login(b, fixture);
await login(c, nonadmin);
assert.equal(
  (await a.rpc("has_active_admin_session")).data,
  true,
  "admin session allowed",
);
assert.equal(
  (await b.rpc("has_active_admin_session")).data,
  true,
  "second session allowed",
);
assert.equal(
  (await c.rpc("has_active_admin_session")).data,
  false,
  "nonadmin denied",
);
assert.equal(
  (await c.from("admins").select("id")).data?.length,
  0,
  "RLS nonadmin",
);
assert.equal(
  !!(await userClient().from("admins").select("id")).error,
  true,
  "anon table denied",
);
assert.equal(
  !!(
    await a.rpc("consume_rate_limit", {
      p_namespace: "forged",
      p_operation: "login_ip",
      p_subject_hash: "a".repeat(64),
    })
  ).error,
  true,
  "client limiter denied",
);
const claims = await a.auth.getClaims();
const sid = claims.data?.claims.session_id;
assert.equal(typeof sid, "string");
const oldSession = await a.auth.getSession();
const token = oldSession.data.session?.access_token;
assert.equal(typeof token, "string");
const refresh = await a.auth.refreshSession();
assert.equal(!!refresh.error, false, "refresh works");
assert.equal(
  (await a.auth.getClaims()).data?.claims.session_id,
  sid,
  "refresh keeps original session",
);
assert.equal(!!(await a.rpc("record_admin_login")).error, false, "login audit");
assert.equal(!!(await a.rpc("record_admin_login")).error, false, "audit retry");
const audit = await a
  .from("audit_logs")
  .select("id,actor_id,action,old_values,new_values")
  .eq("session_id", sid);
assert.equal(audit.data?.length, 1, "one event per login");
assert.equal(audit.data?.[0].actor_id, fixture.id, "verified actor");
assert.equal(
  JSON.stringify(audit.data).includes(fixture.password),
  false,
  "audit has no password",
);
assert.equal(
  !!(await a.from("audit_logs").delete().eq("actor_id", fixture.id)).error,
  true,
  "audit immutable to client",
);
await operator.from("admins").update({ is_active: false }).eq("id", fixture.id);
assert.equal(
  (await b.rpc("has_active_admin_session")).data,
  false,
  "inactive denies existing JWT",
);
await operator.from("admins").update({ is_active: true }).eq("id", fixture.id);
assert.equal(
  !!(await a.auth.signOut({ scope: "local" })).error,
  false,
  "provider local logout",
);
const stale = createClient(
  required("NEXT_PUBLIC_SUPABASE_URL"),
  required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  { ...options, global: { headers: { Authorization: `Bearer ${token}` } } },
);
assert.equal(
  (await stale.rpc("has_active_admin_session")).data,
  false,
  "old JWT denied after logout",
);
assert.equal(
  (await b.rpc("has_active_admin_session")).data,
  true,
  "other session remains active",
);
const settings = await fetch(
  required("NEXT_PUBLIC_SUPABASE_URL") + "/auth/v1/settings",
  { headers: { apikey: required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") } },
).then((r) => r.json());
assert.equal(settings.disable_signup, true, "public signup disabled");
assert.equal(settings.external.anonymous_users, false);
assert.equal(settings.external.email, true);
const signup = await userClient().auth.signUp({
  email: `uvics-signup-${randomUUID()}@example.invalid`,
  password: randomBytes(24).toString("base64url"),
});
assert.equal(!!signup.error, true, "direct signup rejected");
assert.equal(
  !!(await userClient().auth.signInAnonymously()).error,
  true,
  "anonymous sign-in rejected",
);
assert.equal(
  !!(
    await userClient().auth.signInWithPassword({
      email: fixture.email,
      password: "incorrect-password",
    })
  ).error,
  true,
  "bad credentials rejected",
);
await b.auth.signOut({ scope: "local" });
await c.auth.signOut({ scope: "local" });
const schema = psql(
  "begin read only;select count(*) from public.audit_logs;commit;",
);
assert.equal(schema.includes("0\r\n"), false, "persistent audit exists");
console.log(
  JSON.stringify({
    target: target(),
    auth: "PASS",
    checks: [
      "two sessions",
      "refresh same session",
      "RLS anon/nonadmin/inactive",
      "client RPC denial",
      "audit persisted and immutable",
      "local logout",
      "old JWT denied",
      "signup/anonymous rejected",
      "invalid credentials",
    ],
    fixture_manifest: path,
    fixture_users: run.users.map((u) => ({ label: u.label, id: u.id })),
  }),
);
