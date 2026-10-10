import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const loaded = { exports: {} };
const code = ts.transpileModule(readFileSync(new URL("../features/assistant/components/message-content.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
vm.runInNewContext(code, { exports: loaded.exports, require: createRequire(import.meta.url) });
const render = (text, formatted = true) => renderToStaticMarkup(createElement(loaded.exports.MessageContent, { text, formatted }));

test("assistant notes, tips and examples render as paragraphs and separate bullet items", () => {
  const html = render('Catatan Anda disimpan:\nKetua pelaksana Budi Santoso\n\n**Tips**:\n• *Nama kegiatan: Workshop*\n• Tanggal: 28 Oktober\n• Ruangan: D4');
  assert.match(html, /whitespace-pre-wrap.*Catatan Anda disimpan:\nKetua pelaksana Budi Santoso/);
  assert.match(html, /<strong>Tips<\/strong>/);
  assert.match(html, /<em>Nama kegiatan: Workshop<\/em>/);
  assert.equal((html.match(/<li\b/g) ?? []).length, 3);
  assert.equal((html.match(/<ul\b/g) ?? []).length, 1);
  assert.doesNotMatch(html, /\*\*Tips\*\*/);
});

test("CRLF, plain line breaks and blank paragraphs are preserved", () => {
  const html = render("Nama: Budi\r\nJabatan: Ketua Pelaksana\r\n\r\nSilakan lanjutkan.");
  assert.equal((html.match(/<p\b/g) ?? []).length, 2);
  assert.match(html, /Nama: Budi\nJabatan: Ketua Pelaksana/);
});

test("numbered lists retain their numbers and can follow bullet lists", () => {
  const html = render("- Proposal\n* LPJ\n3. Isi data\n4) Generate\n\nKoreksi `nama_kegiatan`.");
  assert.match(html, /<ul\b/);
  assert.match(html, /<ol[^>]*start="3"/);
  assert.match(html, /<li[^>]*value="4"/);
  assert.match(html, /<code[^>]*>nama_kegiatan<\/code>/);
});

test("user messages remain literal, including stars and bullet markers", () => {
  const html = render("**Nama saya**\n- Budi", false);
  assert.match(html, /\*\*Nama saya\*\*\n- Budi/);
  assert.doesNotMatch(html, /<strong>|<ul\b/);
});

test("model HTML is escaped rather than executed", () => {
  const html = render('<script>alert(1)</script>\n• <img src=x onerror=alert(1)>');
  assert.doesNotMatch(html, /<script|<img/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;img/);
});

test("unmatched formatting and empty responses do not crash", () => {
  assert.match(render("**Belum ditutup"), /\*\*Belum ditutup/);
  assert.match(render("*"), />\*<\/p>/);
  assert.doesNotThrow(() => render(""));
});
