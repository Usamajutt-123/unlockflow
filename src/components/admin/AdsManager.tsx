"use client";
import { useEffect, useState } from "react";
import type { Ad, AdSlot } from "@/lib/types";
import { AD_SLOTS, AD_SLOT_LABELS } from "@/lib/types";

interface Props {
  token: string;
  auth: any;
}

export default function AdsManager({ token, auth }: Props) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Ad | null>(null);
  const [notice, setNotice] = useState("");
  const [err, setErr] = useState("");

  const flash = (m: string) => { setNotice(m); setTimeout(() => setNotice(""), 3000); };

  useEffect(() => {
    fetch("/api/admin/ads", { headers: auth })
      .then((r) => r.json())
      .then((d) => setAds(d.ads || []))
      .finally(() => setLoading(false));
  }, [token]);

  const remove = async (id: string) => {
    if (!confirm("Delete this ad?")) return;
    const r = await fetch(`/api/admin/ads/${id}`, { method: "DELETE", headers: auth });
    if (r.ok) { setAds((as) => as.filter((a) => a.id !== id)); flash("Ad deleted"); }
    else flash("Failed to delete ad");
  };

  const toggle = async (ad: Ad) => {
    const r = await fetch(`/api/admin/ads/${ad.id}`, {
      method: "PATCH", headers: { ...auth, "content-type": "application/json" },
      body: JSON.stringify({ active: !ad.active }),
    });
    const j = await r.json();
    if (r.ok && j.ad) {
      setAds((as) => as.map((a) => (a.id === ad.id ? j.ad : a)));
      flash(ad.active ? "Ad deactivated" : "Ad activated");
    } else flash(j.error || "Failed to toggle ad");
  };

  const slotBadge = (slot: AdSlot) => {
    const styles: Record<AdSlot, string> = {
      banner: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
      task: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
      bottom: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
    };
    return (
      <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[slot]}`}>
        {slot}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Ads</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ads shown on unlock pages — banner (below hero), inside the task list, and the fixed bottom bar.
          </p>
        </div>
        <button onClick={() => setEditing({} as Ad)} className="btn-primary !py-2 !text-xs">
          + New Ad
        </button>
      </div>

      {notice && <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">{notice}</div>}
      {err && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{err}</div>}

      {editing && (
        <AdForm
          initial={editing}
          auth={auth}
          onClose={() => setEditing(null)}
          onSaved={(a) => {
            setAds((as) => {
              const exists = as.some((x) => x.id === a.id);
              return exists ? as.map((x) => (x.id === a.id ? a : x)) : [a, ...as];
            });
            setEditing(null);
            flash("Ad saved");
          }}
        />
      )}

      {loading ? (
        <div className="py-10 text-center text-slate-400">Loading…</div>
      ) : ads.length === 0 ? (
        <div className="card p-10 text-center text-slate-500 dark:border-night-700 dark:bg-night-900 dark:text-slate-400">
          No ads yet. Create your first one — it will appear on every unlock page.
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => (
            <div key={ad.id} className="card flex flex-wrap items-center gap-3 p-4 dark:border-night-700 dark:bg-night-900">
              {ad.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ad.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-xl dark:bg-brand-500/10">📣</span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-slate-800 dark:text-slate-100">{ad.title || "Untitled ad"}</span>
                  {slotBadge(ad.slot)}
                  {!ad.active && <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-night-700 dark:text-slate-300">off</span>}
                </div>
                {ad.link_url && <div className="truncate text-xs text-slate-400">{ad.link_url}</div>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(ad)} className="btn-ghost !py-1.5 !text-xs">{ad.active ? "Deactivate" : "Activate"}</button>
                <button onClick={() => setEditing(ad)} className="btn-ghost !py-1.5 !text-xs">Edit</button>
                <button onClick={() => remove(ad.id!)} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13a1 1 0 0 0 1 .8h8a1 1 0 0 0 1-.8L18 7M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdForm(props: { initial: Ad; auth: any; onClose: () => void; onSaved: (a: Ad) => void }) {
  const [form, setForm] = useState<Ad>(() => ({
    id: props.initial.id || "",
    slot: props.initial.slot || "banner",
    title: props.initial.title || "",
    image_url: props.initial.image_url || "",
    link_url: props.initial.link_url || "",
    active: props.initial.active ?? true,
    created_at: props.initial.created_at || "",
  }));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title.trim() && !form.image_url.trim()) {
      setErr("Add a title or an image URL");
      return;
    }
    setBusy(true); setErr("");
    const isNew = !form.id;
    const r = await fetch(isNew ? "/api/admin/ads" : `/api/admin/ads/${form.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { ...props.auth, "content-type": "application/json" },
      body: JSON.stringify({ slot: form.slot, title: form.title, image_url: form.image_url, link_url: form.link_url, active: form.active }),
    });
    const j = await r.json();
    setBusy(false);
    if (r.ok && j.ad) props.onSaved(j.ad);
    else setErr(j.error || "Failed to save ad");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-950/60 p-4 backdrop-blur-sm" onClick={props.onClose}>
      <div className="card w-full max-w-lg p-6 dark:border-night-700 dark:bg-night-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink dark:text-white">{form.id ? "Edit Ad" : "New Ad"}</h3>
          <button onClick={props.onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        {err && <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{err}</div>}

        <div className="space-y-3">
          <div>
            <label className="label">Placement *</label>
            <select value={form.slot} onChange={(e) => set("slot", e.target.value)} className="field">
              {AD_SLOTS.map((s) => <option key={s} value={s}>{AD_SLOT_LABELS[s]}</option>)}
            </select>
          </div>
          <div><label className="label">Ad title</label><input value={form.title} onChange={(e) => set("title", e.target.value)} className="field" placeholder="e.g. Check out our sponsor" /></div>
          <div><label className="label">Image URL (optional)</label><input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} className="field" placeholder="https://…/banner.jpg" /></div>
          <div><label className="label">Link URL (optional)</label><input value={form.link_url} onChange={(e) => set("link_url", e.target.value)} className="field" placeholder="https://…" /></div>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4" />
            Active
          </label>
          <div className="flex gap-2 pt-2">
            <button onClick={save} disabled={busy} className="btn-primary flex-1">{busy ? "Saving…" : "Save Ad"}</button>
            <button onClick={props.onClose} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
