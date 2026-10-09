import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

function loadBackend(env, fetch = async () => new Response()) {
  const compile = (path) => ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const errors = { exports: {} };
  vm.runInNewContext(compile("../lib/api/errors.ts"), { exports: errors.exports, DOMException });
  const backend = { exports: {} };
  vm.runInNewContext(compile("../lib/server/backend.ts"), {
    exports: backend.exports,
    require: (name) => { assert.equal(name, "@/lib/api/errors"); return errors.exports; },
    process: { env }, URL, Headers, AbortSignal, fetch,
  });
  return backend.exports;
}

test("BACKEND_URL is used even if the old variable points to localhost", () => {
  const backend = loadBackend({ BACKEND_URL: "https://api.example.com/", SIGNIT_API_BASE_URL: "http://localhost:5217" });
  assert.equal(backend.backendBaseUrl(), "https://api.example.com");
});

test("missing BACKEND_URL fails explicitly instead of using localhost", () => {
  const backend = loadBackend({ SIGNIT_API_BASE_URL: "http://localhost:5217" });
  assert.throws(() => backend.backendBaseUrl(), (error) => error.status === 503 && error.code === "backend_configuration_missing");
});

test("invalid origins are rejected", () => {
  for (const value of ["api.example.com", "ftp://api.example.com", "https://api.example.com/api/v1", "https://user:secret@api.example.com", "https://api.example.com?token=secret"]) {
    assert.throws(() => loadBackend({ BACKEND_URL: value }).backendBaseUrl(), (error) => error.code === "backend_configuration_invalid");
  }
});

test("login, session and resource calls use the configured server without duplicating /api/v1", async () => {
  const calls = [];
  const backend = loadBackend({ BACKEND_URL: " http://signit.indonesiacentral.cloudapp.azure.com:8080/ " }, async (url, options) => {
    calls.push({ url, options });
    return new Response("{}", { headers: { "content-type": "application/json" } });
  });
  for (const path of ["/api/v1/auth/login", "/api/v1/me", "/api/v1/letters", "/api/v1/auth/refresh"]) {
    await backend.backendFetch(path, { token: "test-only-token" });
    const call = calls.at(-1);
    assert.equal(call.url, `http://signit.indonesiacentral.cloudapp.azure.com:8080${path}`);
    assert.equal(call.options.headers.get("Authorization"), "Bearer test-only-token");
    assert.equal(call.options.cache, "no-store");
  }
});
