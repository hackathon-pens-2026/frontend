"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

type Template = { typeId: string; name: string; fields: { key: string; label: string; type: string; required: boolean; valueSource: string }[] };
type Choice = { id: string; name: string; code?: string };
type Candidate = { userId: string; name: string; positionCode: string };
type Draft = { id: string; version: string; revisionId: string; contentHash: string };
type Preview = { jobId: string; state: string; errorCode: string | null; reviewDocumentId: string | null; reviewHash: string | null; slots: unknown[]; downloadUrl: string | null };
type Stage = { order: number; name: string; positionName: string };

export function LetterForm() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [organizations, setOrganizations] = useState<Choice[]>([]);
  const [facilities, setFacilities] = useState<Choice[]>([]);
  const [resources, setResources] = useState<Choice[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [typeId, setTypeId] = useState("");
  const [title, setTitle] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [organizationId, setOrganization] = useState("");
  const [facilityId, setFacility] = useState("");
  const [resourceId, setResource] = useState("");
  const [committeeChairId, setCommittee] = useState("");
  const [organizationChairId, setChair] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitKey = useRef("");
  const template = templates.find((item) => item.typeId === typeId);
  useEffect(() => {
    let active = true;
    Promise.all([api<Template[]>("templates"), api<Choice[]>("routing/organizations"), api<Choice[]>("routing/facilities")]).then(([t, o, f]) => { if (active) { setTemplates(t); setOrganizations(o); setFacilities(f); } }).catch((e) => { if (active) setMessage(e.message); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!organizationId) return;
    let active = true;
    api<Candidate[]>(`routing/organizations/${organizationId}/candidates`).then((value) => { if (active) setCandidates(value); }).catch((e) => { if (active) setMessage(e.message); });
    return () => { active = false; };
  }, [organizationId]);
  useEffect(() => {
    if (!facilityId) return;
    let active = true;
    api<Choice[]>(`routing/resources?facilityId=${facilityId}`).then((value) => { if (active) setResources(value); }).catch((e) => { if (active) setMessage(e.message); });
    return () => { active = false; };
  }, [facilityId]);
  useEffect(() => {
    if (!draft || !preview || !["Pending", "Processing"].includes(preview.state)) return;
    let active = true;
    const timer = setTimeout(() => {
      api<Preview>(`letters/${draft.id}/previews/${preview.jobId}`).then((value) => { if (active) setPreview(value); }).catch((e) => { if (active) setMessage(e.message); });
    }, 2000);
    return () => { active = false; clearTimeout(timer); };
  }, [draft, preview]);
  const routing = { typeId, organizationId, committeeChairId, organizationChairId, resourceId: resourceId || null };
  function invalidate() { setPreview(null); setStages([]); submitKey.current = ""; }
  async function generate() {
    setBusy(true); setMessage("");
    try {
      const saved = draft ? await api<Draft>(`letters/${draft.id}/draft`, { expectedVersion: draft.version, expectedRevisionId: draft.revisionId, expectedContentHash: draft.contentHash, title, fields }, "PUT", crypto.randomUUID()) : await api<Draft>("letters/drafts", { typeId, title, fields });
      setDraft(saved);
      setStages(await api<Stage[]>("letters/routing-preview", routing));
      setPreview(await api<Preview>(`letters/${saved.id}/preview`, { ...routing, expectedVersion: saved.version, expectedRevisionId: saved.revisionId, expectedContentHash: saved.contentHash }));
    } catch (e) { setMessage(e instanceof Error ? e.message : "Generate gagal."); }
    finally { setBusy(false); }
  }
  async function submit() {
    if (!draft || preview?.state !== "Ready") return;
    setBusy(true); setMessage("");
    submitKey.current ||= crypto.randomUUID();
    try {
      const result = await api<{ number: string }>(`letters/${draft.id}/submit`, { ...routing, expectedVersion: draft.version, expectedRevisionId: draft.revisionId, expectedContentHash: draft.contentHash, reviewDocumentId: preview.reviewDocumentId, expectedReviewHash: preview.reviewHash, slots: preview.slots }, "POST", submitKey.current);
      setSubmitted(true); setMessage(`Surat berhasil diajukan: ${result.number}`);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Pengajuan gagal."); }
    finally { setBusy(false); }
  }
  const inputClass = "mt-1 block w-full rounded-lg border border-line bg-surface p-3";
  return <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8"><h1 className="text-title font-semibold">Buat pengajuan</h1><p>Ingin membuat tipe surat apa?</p><fieldset disabled={busy || submitted || !!preview && ["Queued", "Processing"].includes(preview.state)} className="space-y-5 disabled:opacity-70"><label className="block">Tipe surat<select className={inputClass} value={typeId} disabled={!!draft} onChange={(e) => { setTypeId(e.target.value); setFields({}); invalidate(); }}><option value="">Pilih tipe surat</option>{templates.map((t) => <option key={t.typeId} value={t.typeId}>{t.name}</option>)}</select></label>{template && <><label className="block">Judul<input className={inputClass} maxLength={300} value={title} onChange={(e) => { setTitle(e.target.value); invalidate(); }} /></label><div className="grid gap-4 sm:grid-cols-2">{template.fields.filter((f) => f.valueSource === "user").map((f) => <label className="block" key={f.key}>{f.label}{f.required && " *"}<textarea className={inputClass} maxLength={4000} value={fields[f.key] ?? ""} onChange={(e) => { setFields({ ...fields, [f.key]: e.target.value }); invalidate(); }} /></label>)}</div><label className="block">Organisasi<select className={inputClass} value={organizationId} onChange={(e) => { setOrganization(e.target.value); setCandidates([]); setCommittee(""); setChair(""); invalidate(); }}><option value="">Pilih organisasi</option>{organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>{([['Ketupel', 'Ketua Pelaksana', committeeChairId, setCommittee], ['KetuaOrganisasi', 'Ketua Organisasi', organizationChairId, setChair]] as const).map(([code, label, value, setter]) => <label className="block" key={code}>{label}<select className={inputClass} value={value} onChange={(e) => { setter(e.target.value); invalidate(); }}><option value="">Pilih peserta</option>{candidates.filter((c) => c.positionCode === code).map((c) => <option key={c.userId} value={c.userId}>{c.name}</option>)}</select></label>)}{template.fields.some((f) => f.valueSource === "resource") && <><label className="block">Gedung / fasilitas<select className={inputClass} value={facilityId} onChange={(e) => { setFacility(e.target.value); setResource(""); setResources([]); invalidate(); }}><option value="">Pilih fasilitas</option>{facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label><label className="block">Ruangan<select className={inputClass} value={resourceId} onChange={(e) => { setResource(e.target.value); invalidate(); }}><option value="">Pilih ruangan</option>{resources.map((r) => <option key={r.id} value={r.id}>{r.code}</option>)}</select></label></>}<button onClick={generate} disabled={!title || !organizationId || !committeeChairId || !organizationChairId} className="rounded-lg bg-primary px-5 py-3 text-surface disabled:opacity-50">{busy ? "Memproses…" : "Simpan dan Generate preview"}</button></>}</fieldset>{message && <p role="status" className="rounded border border-line bg-surface p-4">{message}</p>}{draft && <p className="text-micro">ID draft: {draft.id}</p>}{stages.length > 0 && <section><h2 className="font-semibold">Urutan persetujuan dari backend</h2><ol className="list-decimal pl-6">{stages.map((s) => <li key={s.order}>{s.positionName} — {s.name}</li>)}</ol></section>}{preview && <section className="space-y-4"><p>Status preview: {preview.state}{preview.errorCode && ` (${preview.errorCode})`}</p>{preview.state === "Ready" && draft && preview.reviewDocumentId && <><a className="underline" target="_blank" rel="noreferrer" href={`/api/backend/letters/${draft.id}/documents/${preview.reviewDocumentId}`}>Buka PDF preview</a><p>Periksa PDF sebelum mengajukan. Generate tidak otomatis mengajukan surat.</p><button disabled={busy || submitted} onClick={submit} className="rounded-lg bg-primary px-5 py-3 text-surface disabled:opacity-50">Ajukan surat</button></>}</section>}</main>;
}
