import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";

const code = ts.transpileModule(readFileSync(new URL("../app/api/uat/select-account/route.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const key = "a-test-only-access-key-with-32-characters";
function setup(env = {}, upstream = async () => Response.json({ user: { email: "uat@test.example" }, accessToken: "test-token" })) {
  const exports = {};
  const calls = [];
  const cookies = [];
  const require = createRequire(import.meta.url);
  const modules = {
    "@/lib/auth/personas": { DEMO_PERSONAS: [{ id: "pengaju", email: "uat@test.example" }] },
    "@/lib/server/backend": { backendFetch: async (...args) => { calls.push(args); return upstream(); } },
    "@/lib/server/session": { setAuthCookies: async (tokens) => cookies.push(tokens) },
  };
  vm.runInNewContext(code, { exports, require: (id) => modules[id] ?? require(id), Response, URL, process: { env } });
  const post = (input = {}, origin = "https://uat.example") => exports.POST(new Request("https://uat.example/api/uat/select-account", {
    method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(input),
  }));
  return { post, calls, cookies };
}
const env = { UAT_ACCOUNT_PICKER_ENABLED: "true", UAT_ACCESS_KEY: key, UAT_ACCOUNT_PASSWORD: "test-only-password" };
test("disabled and incomplete configuration fail closed", async () => {
  assert.equal((await setup().post()).status, 503);
  assert.equal((await setup({ UAT_ACCOUNT_PICKER_ENABLED: "true" }).post()).status, 503);
});
test("wrong origin, wrong key and unknown account never reach backend", async () => {
  const harness = setup(env);
  assert.equal((await harness.post({ accessKey: key, personaId: "pengaju" }, "https://other.example")).status, 403);
  assert.equal((await harness.post({ accessKey: "wrong", personaId: "pengaju" })).status, 403);
  assert.equal((await harness.post({ accessKey: key, personaId: "admin" })).status, 400);
  assert.equal(harness.calls.length, 0);
});
test("valid picker uses allowlisted credentials and returns user, not tokens", async () => {
  const harness = setup(env);
  const response = await harness.post({ accessKey: key, personaId: "pengaju", email: "attacker@example.com" });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { email: "uat@test.example" });
  assert.deepEqual(JSON.parse(harness.calls[0][1].body), { email: "uat@test.example", password: "test-only-password" });
  assert.equal(harness.cookies.length, 1);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});
test("backend refusal, network failure and identity mismatch never set cookies", async () => {
  for (const upstream of [async () => new Response(null, { status: 401 }), async () => { throw new Error("private diagnostic"); }, async () => Response.json({ user: { email: "other@example.com" } })]) {
    const harness = setup(env, upstream);
    assert.notEqual((await harness.post({ accessKey: key, personaId: "pengaju" })).status, 200);
    assert.equal(harness.cookies.length, 0);
  }
});
