import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

function load(name, response = {}) {
  const exports = {};
  const calls = [];
  const transport = {
    apiFetch: async (path, options) => { calls.push({ path, options }); return response; },
    apiDownload: async (path) => { calls.push({ path }); return new Blob(); },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL(`../lib/api/${name}.ts`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, require: () => transport, URLSearchParams });
  return { api: exports, calls };
}

test("final PDF and preview use distinct endpoints", async () => {
  const { api, calls } = load("letters");
  await api.downloadFinalLetter("letter");
  await api.downloadLetterDocument("letter", "review");
  assert.equal(calls[0].path, "/letters/letter/finalization/document");
  assert.equal(calls[1].path, "/letters/letter/documents/review");
});
test("finalization retry preserves revision and idempotency contract", async () => {
  const { api, calls } = load("finalization");
  const expected = { expectedRevisionId: "revision", expectedContentHash: "hash", expectedVersion: "version" };
  await api.retryFinalization("letter", expected, "retry-key");
  assert.equal(calls[0].path, "/letters/letter/finalization/retry");
  assert.equal(calls[0].options.json, expected);
  assert.equal(calls[0].options.headers["Idempotency-Key"], "retry-key");
});
test("room schedule and availability forward structured times to backend", async () => {
  const { api, calls } = load("rooms");
  await api.getRoomSchedule("room", "2026-10-10T01:00:00Z", "2026-10-10T08:00:00Z");
  await api.checkAvailability("room", "2026-10-10T01:00:00Z", "2026-10-10T08:00:00Z");
  assert.match(calls[0].path, /^\/rooms\/room\/schedule\?from=/);
  assert.equal(calls[1].options.json.roomId, "room");
});
test("resume and revocation use backend task mutations, not local status updates", async () => {
  const { api, calls } = load("workflow");
  const request = { expectedTaskVersion: "task-version", expectedRevisionId: "revision", expectedContentHash: "hash", reason: "test" };
  for (const action of ["resume", "revoke-delegation"]) await api.mutateTask("task", action, request, "key");
  assert.equal(calls[0].path, "/tasks/task/resume");
  assert.equal(calls[1].path, "/tasks/task/revoke-delegation");
  assert.equal(calls[1].options.json, request);
});

test("letter and task lists preserve returned rows instead of replacing them with empty data", async () => {
  for (const [module, method] of [["letters", "listMyLetters"], ["workflow", "listMyTasks"]]) {
    const response = { page: 1, pageSize: 20, total: 1, items: [{ id: "actual-server-row" }] };
    const { api } = load(module, response);
    assert.equal(await api[method](), response);
    const empty = { page: 1, pageSize: 20, total: 0, items: [] };
    assert.equal(await load(module, empty).api[method](), empty);
  }
});

test("invalid or inconsistent list payloads are errors, not an empty inbox", async () => {
  for (const [module, method] of [["letters", "listMyLetters"], ["workflow", "listMyTasks"]]) {
    for (const response of [{}, { total: 1, items: [] }, { total: 0, items: [{ id: "row" }] }]) {
      await assert.rejects(load(module, response).api[method](), /kontrak API/);
    }
  }
});
