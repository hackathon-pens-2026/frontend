import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

function load(path) {
  const loaded = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { exports: loaded.exports, URL, Date, Map, Promise });
  return loaded.exports;
}
const { postLoginPath, routeRedirect, sanitizeInternalPath } = load("../lib/auth/routing.ts");

test("four categories route to exactly two surfaces, with a student task inbox", () => {
  for (const [userCategory, uiSurface, expected] of [
    ["StudentGeneral", "Student", "/"], ["StudentDagri", "Student", "/"],
    ["BAAK", "Management", "/manajemen"], ["Management", "Management", "/manajemen"],
  ]) {
    const user = { userCategory, uiSurface, capabilities: ["Requester", "Approver"] };
    assert.equal(postLoginPath(user, null), expected);
    assert.equal(postLoginPath(user, "/manajemen"), uiSurface === "Student" ? "/persetujuan" : expected);
    assert.equal(postLoginPath(user, "/staff"), uiSurface === "Student" ? "/persetujuan" : "/manajemen");
  }
});

test("safe letter deep links survive login but unauthorized surface targets do not", () => {
  const user = { uiSurface: "Management", capabilities: ["Approver"] };
  assert.equal(postLoginPath(user, "/surat/123?view=pdf"), "/surat/123?view=pdf");
  assert.equal(postLoginPath(user, "/"), "/manajemen");
  assert.equal(routeRedirect({ uiSurface: "Student", capabilities: ["Requester"] }, "/persetujuan"), "/");
  assert.equal(routeRedirect({ uiSurface: "Student", capabilities: ["Signer"] }, "/persetujuan"), null);
});

test("login return URLs cannot escape the origin or point to auth/API routes", () => {
  for (const path of ["//evil.example", "/\\evil.example", "https://evil.example", "/%2f%2fevil.example",
    "/%5cevil.example", "/api/v1/me", "/%61pi/v1/me", "/login?next=/login", "/reset-password", "/bad%zz"]) {
    assert.equal(sanitizeInternalPath(path), null, path);
  }
});

test("simultaneous refresh requests share results only within the same session", async () => {
  const { createRefreshCoordinator } = load("../lib/server/refresh-coordinator.ts");
  const coordinate = createRefreshCoordinator();
  let calls = 0;
  let finish;
  const pending = new Promise((resolve) => { finish = resolve; });
  const first = coordinate("session-a", async () => { calls++; await pending; return "user-a"; });
  const same = coordinate("session-a", async () => { calls++; return "wrong"; });
  const other = coordinate("session-b", async () => { calls++; return "user-b"; });
  finish();
  assert.deepEqual(await Promise.all([first, same, other]), ["user-a", "user-a", "user-b"]);
  assert.equal(calls, 2);
  assert.equal(await coordinate("session-a", async () => "wrong-late-retry"), "user-a");
});

test("failed refresh requests can retry rather than poisoning the session", async () => {
  const { createRefreshCoordinator } = load("../lib/server/refresh-coordinator.ts");
  const coordinate = createRefreshCoordinator();
  await assert.rejects(coordinate("a", async () => { throw new Error("temporary network failure"); }));
  assert.equal(await coordinate("a", async () => "recovered"), "recovered");
});
