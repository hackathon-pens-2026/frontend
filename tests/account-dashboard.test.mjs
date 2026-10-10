import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";

const code = ts.transpileModule(readFileSync(new URL("../lib/api/account-data.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function load(actorId, letters, tasks) {
  const exports = {};
  const calls = [];
  const modules = {
    "./client": { apiFetch: async (path) => { calls.push(path); return { id: actorId }; } },
    "./letters": { listMyLetters: async () => { calls.push("letters"); return letters; } },
    "./workflow": { listMyTasks: async () => { calls.push("tasks"); return tasks; } },
  };
  vm.runInNewContext(code, { exports, require: (id) => modules[id] });
  return { api: exports, calls };
}
test("requester dashboard keeps all five letters and backend status counts", async () => {
  const letters = { total: 5, statusCounts: { InProgress: 1, Draft: 4 }, items: Array.from({ length: 5 }, (_, id) => ({ id })) };
  const tasks = { total: 0, items: [] };
  const { api, calls } = load("requester", letters, tasks);
  const result = await api.loadAccountDashboard("requester");
  assert.equal(result.letters, letters);
  assert.equal(result.letters.items.length, 5);
  assert.equal(result.letters.statusCounts.InProgress, 1);
  assert.equal(result.letters.statusCounts.Draft, 4);
  assert.equal(calls[0], "/me");
});
test("signer dashboard keeps its active task even when it owns no letters", async () => {
  const tasks = { total: 1, items: [{ id: "task", letterId: "letter", status: "Active" }] };
  const { api } = load("signer", { total: 0, items: [], statusCounts: {} }, tasks);
  const result = await api.loadAccountDashboard("signer");
  assert.equal(result.tasks, tasks);
  assert.equal(result.tasks.items[0].letterId, "letter");
});
test("mismatched browser identity cannot silently render another account's empty lists", async () => {
  const { api, calls } = load("wrong-account", {}, {});
  await assert.rejects(api.loadAccountDashboard("selected-account"), /Sesi browser tidak sesuai/);
  assert.deepEqual(calls, ["/me"]);
});
