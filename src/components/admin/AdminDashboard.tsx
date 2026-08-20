"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getTaskOption, hashPassword } from "@/lib/tasks";
import { BrandIcon } from "../brandIcons";
import { Alert, ConfirmDialog, type ConfirmState } from "../Alerts";
import Logo from "../Logo";
import { THEMES } from "@/lib/themes";
import dynamic from "next/dynamic";

const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
import StatsCards from "./StatsCards";
import BlogManager from "./BlogManager";
import AdsManager from "./AdsManager";

type Tab = "overview" | "links" | "analytics" | "ads" | "admins" | "blog";

interface TaskRow { id: string; label: string; task_url: string; task_type: string; position: number }
interface LinkRow {
  id: string; slug: string; title: string; description: string; destination_url: string;
  views: number; clicks: number; active: boolean; created_at: string;
  banner_url: string; icon_url: string; video_url?: string; has_password: boolean; expiry_date: string | null;
  theme?: string;
  tasks?: TaskRow[];
}
interface CompletionRow { id: string; linkId: string; slug: string; completions: number; day: string }
interface AdminRow { email: string; created_at: string }

export default function AdminDashboard({ session }: { session: Session }) {
  const [tab, setTab] = useState<Tab>("overview");
  const token = session.access_token;

  const [stats, setStats] = useState<any>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [completions, setCompletions] = useState<CompletionRow[]>([]);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [apiError, setApiError] = useState("");
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const auth = { authorization: `Bearer ${token}` };

  const refresh = useCallback(async () => {
    try {
      const [s, l, a, c, ad] = await Promise.all([
        fetch("/api/admin/stats", { headers: auth }).then((r) => r.json()),
        fetch("/api/admin/links", { headers: auth }).then((r) => r.json()),
        fetch("/api/admin/analytics", { headers: auth }).then((r) => r.json()),
        fetch("/api/admin/completions", { headers: auth }).then((r) => r.json()),
        fetch("/api/admin/admins", { headers: auth }).then((r) => r.json()),
      ]);
      // Surface API errors (401, missing columns, etc.) instead of silently showing 0s.
      const errs: string[] = [];
      if (s?.error) errs.push(`stats: ${s.error}`);
      if (l?.error) errs.push(`links: ${l.error}`);
      if (a?.error) errs.push(`analytics: ${a.error}`);
      if (c?.error) errs.push(`completions: ${c.error}`);
      if (ad?.error) errs.push(`admins: ${ad.error}`);
      setApiError(errs.join(" · "));
      setStats(s);
      setLinks(l.links || []);
      setSeries(a.series || []);
      setCompletions(c.completions || []);
      setAdmins(ad.admins || []);
    } catch (err) {
      setApiError(String(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  const signOut = async () => { await supabase.auth.signOut(); };

  const flash = (m: string) => { setNotice(m); setTimeout(() => setNotice(""), 3000); };

  const toggleLink = async (id: string, active: boolean) => {
    const r = await fetch(`/api/admin/links/${id}`, {
      method: "PATCH", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ active }),
    });
    if (r.ok) { setLinks((ls) => ls.map((l) => (l.id === id ? { ...l, active } : l))); flash(active ? "Link activated" : "Link deactivated"); }
    else flash("Failed to update link");
  };

  const deleteLink = (id: string) => {
    setConfirmState({
      title: "Delete this link?",
      message: "This will permanently remove the link and all of its tasks.",
      confirmLabel: "Delete",
      tone: "danger",
      action: () => removeLink(id),
    });
  };

  const removeLink = async (id: string) => {
    const r = await fetch(`/api/admin/links/${id}`, { method: "DELETE", headers: auth });
    if (r.ok) { setLinks((ls) => ls.filter((l) => l.id !== id)); flash("Link deleted"); }
    else flash("Failed to delete link");
  };

  const saveLink = async (link: LinkRow) => {
    const body: any = {
      title: link.title, description: link.description || "", destination_url: link.destination_url,
      slug: link.slug, icon_url: link.icon_url || "",
      expiry_date: link.expiry_date || null, active: link.active, theme: link.theme || "midnight",
      video_url: link.video_url || "",
    };
    const r = await fetch(`/api/admin/links/${link.id}`, {
      method: "PATCH", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify(body),
    });
    if (r.ok) { setLinks((ls) => ls.map((l) => (l.id === link.id ? { ...l, ...body } : l))); flash("Link saved"); return true; }
    flash("Failed to save link"); return false;
  };

  const moveTask = async (linkId: string, taskId: string, dir: -1 | 1) => {
    const link = links.find((l) => l.id === linkId);
    if (!link?.tasks) return;
    const ordered = [...link.tasks].sort((a, b) => a.position - b.position);
    const idx = ordered.findIndex((t) => t.id === taskId);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= ordered.length) return;
    [ordered[idx], ordered[swap]] = [ordered[swap], ordered[idx]];
    await fetch("/api/admin/tasks", {
      method: "PATCH", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ link_id: linkId, orderedIds: ordered.map((t) => t.id) }),
    });
    const updated = ordered.map((t, i) => ({ ...t, position: i }));
    setLinks((ls) => ls.map((l) => (l.id === linkId ? { ...l, tasks: updated } : l)));
  };

  const addTask = async (linkId: string, label: string, task_url: string) => {
    if (!label.trim() || !task_url.trim()) return;
    const r = await fetch("/api/admin/tasks", {
      method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ link_id: linkId, task_type: "custom", label, task_url }),
    });
    const j = await r.json();
    if (r.ok && j.task) { setLinks((ls) => ls.map((l) => (l.id === linkId ? { ...l, tasks: [...(l.tasks || []), j.task] } : l))); flash("Task added"); }
    else flash("Failed to add task");
  };

  const deleteTask = async (linkId: string, taskId: string) => {
    const r = await fetch(`/api/admin/tasks/${taskId}`, { method: "DELETE", headers: auth });
    if (r.ok) { setLinks((ls) => ls.map((l) => (l.id === linkId ? { ...l, tasks: (l.tasks || []).filter((t) => t.id !== taskId) } : l))); flash("Task removed"); }
    else flash("Failed to remove task");
  };

  const addAdmin = async (email: string) => {
    const r = await fetch("/api/admin/admins", {
      method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ email }),
    });
    const j = await r.json();
    if (r.ok && j.admin) { setAdmins((a) => [...a, j.admin]); flash("Admin added"); }
    else flash(j.error || "Failed to add admin");
  };

  const removeAdmin = (email: string) => {
    setConfirmState({
      title: "Remove admin?",
      message: `${email} will lose access to this dashboard.`,
      confirmLabel: "Remove",
      tone: "danger",
      action: () => doRemoveAdmin(email),
    });
  };

  const doRemoveAdmin = async (email: string) => {
    const r = await fetch(`/api/admin/admins/${encodeURIComponent(email)}`, { method: "DELETE", headers: auth });
    const j = await r.json();
    if (r.ok) { setAdmins((a) => a.filter((x) => x.email !== email)); flash("Admin removed"); }
    else flash(j.error || "Failed to remove admin");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-night-950">
      {/* Top bar */}
      <header className="glass sticky top-0 z-30 border-b border-slate-200 dark:border-night-700">
        <div className="container-x flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:block dark:text-slate-400">{session.user.email}</span>
            <a href="/" className="btn-ghost !py-2 !text-xs">View Site</a>
            <button onClick={signOut} className="btn-ghost !py-2 !text-xs !text-red-500 hover:!border-red-300 dark:hover:!border-red-500/40">Sign out</button>
          </div>
        </div>
        <div className="container-x flex gap-1 pb-0">
          {(["overview", "links", "analytics", "ads", "blog", "admins"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`relative px-4 py-3 text-sm font-semibold capitalize transition ${tab === t ? "text-brand-600 dark:text-brand-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"}`}>
              {t}
              {tab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600 dark:bg-brand-400" />}
            </button>
          ))}
        </div>
      </header>

      <main className="container-x py-8">
        {notice && <Alert variant="success" className="mb-5">{notice}</Alert>}

        {apiError && (
          <Alert variant="warning" title="Dashboard API error" className="mb-5">
            {apiError}
            <p className="mt-1 text-xs opacity-80">
              If you see &quot;column does not exist&quot; or &quot;relation does not exist&quot;, run the SQL migrations
              (supabase/migrations) in your Supabase SQL editor. If you see &quot;Unauthorized&quot;, make sure your email is in the
              admins table or matches SUPERADMIN_EMAIL.
            </p>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" /></div>
        ) : (
          <>
            {tab === "overview" && (
              <>
                <StatsCards totals={stats?.totals} />
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="card p-5 dark:border-night-700 dark:bg-night-900">
                    <h3 className="font-display text-base font-bold text-ink dark:text-white">Completions (last 14 days)</h3>
                    <p className="mb-3 text-xs text-slate-400">Tasks completed across all links</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={series}>
                        <defs><linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3370ff" stopOpacity={0.5} /><stop offset="100%" stopColor="#3370ff" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <Tooltip contentStyle={{ background: "#0f1626", border: "1px solid #1f2937", borderRadius: 12 }} labelStyle={{ color: "#e2e8f0" }} />
                        <Area type="monotone" dataKey="completions" stroke="#3370ff" strokeWidth={2.5} fill="url(#gC)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="card p-5 dark:border-night-700 dark:bg-night-900">
                    <h3 className="font-display text-base font-bold text-ink dark:text-white">Top links by views & clicks</h3>
                    <p className="mb-3 text-xs text-slate-400">Most-engaged unlock links</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={links.slice(0, 8).map((l) => ({ name: l.slug.length > 12 ? l.slug.slice(0, 12) + "…" : l.slug, views: l.views || 0, clicks: l.clicks || 0 }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <Tooltip contentStyle={{ background: "#0f1626", border: "1px solid #1f2937", borderRadius: 12 }} labelStyle={{ color: "#e2e8f0" }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="views" fill="#3370ff" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="clicks" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent completions */}
                <div className="card mt-6 p-5 dark:border-night-700 dark:bg-night-900">
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">Recent activity</h3>
                  <p className="mb-3 text-xs text-slate-400">Latest task completions across all links</p>
                  {completions.length === 0 ? (
                    <p className="text-sm text-slate-400">No completions yet.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-night-800">
                      {completions.slice(0, 8).map((c) => (
                        <li key={c.id} className="flex items-center gap-3 py-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">+{c.completions} on /unlock/{c.slug}</span>
                          </div>
                          <span className="text-xs text-slate-400">{new Date(c.day + "T00:00:00").toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {tab === "links" && (
              <LinksView
                links={links}
                toggleLink={toggleLink}
                deleteLink={deleteLink}
                saveLink={saveLink}
                moveTask={moveTask}
                addTask={addTask}
                deleteTask={deleteTask}
                onCreated={(nl) => { setLinks((ls) => [nl, ...ls]); flash("Link created"); }}
                token={token}
                auth={auth}
              />
            )}

            {tab === "analytics" && (
              <AnalyticsView links={links} series={series} />
            )}

            {tab === "admins" && (
              <AdminsView admins={admins} currentEmail={session.user.email || ""} onAdd={addAdmin} onRemove={removeAdmin} />
            )}

            {tab === "ads" && <AdsManager token={token} auth={auth} />}

            {tab === "blog" && <BlogManager token={token} auth={auth} />}
          </>
        )}
      </main>

      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
    </div>
  );
}

/* ---------------- Links View ---------------- */
function LinksView(props: {
  links: LinkRow[]; token: string; auth: any;
  toggleLink: (id: string, active: boolean) => void;
  deleteLink: (id: string) => void;
  saveLink: (link: LinkRow) => Promise<boolean>;
  moveTask: (linkId: string, taskId: string, dir: -1 | 1) => void;
  addTask: (linkId: string, label: string, url: string) => void;
  deleteTask: (linkId: string, taskId: string) => void;
  onCreated: (link: LinkRow) => void;
}) {
  const { links, token, auth } = props;
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<LinkRow | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return links;
    return links.filter((l) => (l.title + " " + l.slug + " " + (l.destination_url || "")).toLowerCase().includes(q));
  }, [links, query]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">All Links</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage links, task placement, and link settings.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="m21 21-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search links…" className="field !w-56 !py-2 pl-9 text-xs" />
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary !py-2 !text-xs">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            Create Link
          </button>
        </div>
      </div>

      {showCreate && (
        <CreateLinkModal auth={auth} token={token} onClose={() => setShowCreate(false)} onCreated={props.onCreated} />
      )}
      {editing && (
        <EditLinkModal link={editing} auth={auth} token={token} onClose={() => setEditing(null)} onSave={async (nl) => { if (await props.saveLink(nl)) setEditing(null); }} />
      )}

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card p-10 text-center text-slate-500 dark:border-night-700 dark:bg-night-900 dark:text-slate-400">
            {links.length === 0 ? "No links yet. Create one above or from the Link Generator." : "No links match your search."}
          </div>
        )}
        {filtered.map((l) => (
          <LinkCard key={l.id} link={l}
            toggleLink={props.toggleLink} deleteLink={props.deleteLink} onEdit={() => setEditing(l)}
            moveTask={props.moveTask} addTask={props.addTask} deleteTask={props.deleteTask} />
        ))}
      </div>
    </div>
  );
}

function LinkCard(props: {
  link: LinkRow;
  toggleLink: (id: string, active: boolean) => void;
  deleteLink: (id: string) => void;
  onEdit: () => void;
  moveTask: (linkId: string, taskId: string, dir: -1 | 1) => void;
  addTask: (linkId: string, label: string, url: string) => void;
  deleteTask: (linkId: string, taskId: string) => void;
}) {
  const { link } = props;
  const [open, setOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const tasks = (link.tasks || []).slice().sort((a, b) => a.position - b.position);
  const opt = getTaskOption(link.tasks?.[0]?.task_type || "custom");

  return (
    <div className="card overflow-hidden dark:border-night-700 dark:bg-night-900">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-night-800">
          {link.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={link.icon_url} alt="" className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            <BrandIcon brand={opt?.brand || "custom"} className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold text-slate-800 dark:text-slate-100">{link.title || link.slug}</span>
            {link.has_password && <span title="Password protected" className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">🔒</span>}
            {!link.active && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-500/15 dark:text-red-400">off</span>}
          </div>
          <div className="truncate text-xs text-slate-400">/unlock/{link.slug}</div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span title="Views">👁 {link.views || 0}</span>
          <span title="Clicks">🖱 {link.clicks || 0}</span>
          <span title="Tasks">📋 {tasks.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <button onClick={() => props.toggleLink(link.id, !link.active)}
              className={`relative h-5 w-9 rounded-full transition ${link.active ? "bg-brand-600" : "bg-slate-300 dark:bg-night-700"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${link.active ? "left-[18px]" : "left-0.5"}`} />
            </button>
            {link.active ? "Active" : "Inactive"}
          </label>
          <button onClick={props.onEdit} className="btn-ghost !py-1.5 !text-xs">Edit</button>
          <button onClick={() => setOpen(!open)} className="btn-ghost !py-1.5 !text-xs">{open ? "Close" : "Tasks"}</button>
          <button onClick={() => props.deleteLink(link.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13a1 1 0 0 0 1 .8h8a1 1 0 0 0 1-.8L18 7M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 p-4 dark:border-night-700 dark:bg-night-800/40">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Task Placement</h4>
            <span className="text-xs text-slate-400">Order = display order on the unlock page</span>
          </div>
          <ul className="space-y-2">
            {tasks.length === 0 && <li className="text-sm text-slate-500 dark:text-slate-400">No tasks on this link.</li>}
            {tasks.map((t, i) => {
              const topt = getTaskOption(t.task_type);
              return (
                <li key={t.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-night-700 dark:bg-night-900">
                  <span className="w-5 text-center text-xs font-bold text-slate-400">{i + 1}</span>
                  <BrandIcon brand={topt?.brand || "custom"} className="h-4 w-4" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-200">{t.label}</span>
                  <span className="hidden max-w-[40%] truncate text-xs text-slate-400 sm:block">{t.task_url}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => props.moveTask(link.id, t.id, -1)} disabled={i === 0} className="rounded p-1 text-slate-400 hover:text-brand-600 disabled:opacity-30"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="m18 15-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                    <button onClick={() => props.moveTask(link.id, t.id, 1)} disabled={i === tasks.length - 1} className="rounded p-1 text-slate-400 hover:text-brand-600 disabled:opacity-30"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                    <button onClick={() => props.deleteTask(link.id, t.id)} className="rounded p-1 text-slate-400 hover:text-red-500"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Task name" className="field flex-1 !py-2 text-xs" />
            <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://link" className="field flex-1 !py-2 text-xs" />
            <button onClick={() => { props.addTask(link.id, newLabel, newUrl); setNewLabel(""); setNewUrl(""); }} className="btn-primary shrink-0 !py-2 !text-xs">Add Task</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Create Link Modal ---------------- */
function CreateLinkModal(props: { auth: any; token: string; onClose: () => void; onCreated: (l: LinkRow) => void }) {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const create = async () => {
    setErr("");
    if (!/^https?:\/\//.test(destination)) { setErr("Enter a valid destination URL starting with http(s)://"); return; }
    setBusy(true);
    const r = await fetch("/api/admin/links/create", {
      method: "POST", headers: { ...props.auth, "content-type": "application/json" },
      body: JSON.stringify({ title, description, destination_url: destination, customSlug }),
    });
    const j = await r.json();
    setBusy(false);
    if (r.ok && j.link) { props.onCreated(j.link); props.onClose(); }
    else setErr(j.error || "Failed to create link");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-950/60 p-4 backdrop-blur-sm" onClick={props.onClose}>
      <div className="card w-full max-w-lg p-6 dark:border-night-700 dark:bg-night-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink dark:text-white">Create Link</h3>
          <button onClick={props.onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
        </div>
        <div className="space-y-3">
          <div><label className="label">Destination URL *</label>
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="https://your-reward.com" className="field" /></div>
          <div><label className="label">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your reward is ready" className="field" /></div>
          <div><label className="label">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Complete all tasks to unlock" className="field" /></div>
          <div><label className="label">Custom slug (optional)</label>
            <input value={customSlug} onChange={(e) => setCustomSlug(e.target.value)} placeholder="my-unlock-link" className="field" /></div>
          {err && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{err}</div>}
          <div className="flex gap-2 pt-2">
            <button onClick={create} disabled={busy} className="btn-primary flex-1">{busy ? "Creating…" : "Create Link"}</button>
            <button onClick={props.onClose} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Edit Link Modal ---------------- */
function EditLinkModal(props: { link: LinkRow; auth: any; token: string; onClose: () => void; onSave: (l: LinkRow) => void }) {
  const [form, setForm] = useState<LinkRow>({ ...props.link });
  const [newPass, setNewPass] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string | number | boolean | null) => setForm((f) => ({ ...f, [k]: v as never }));

  const save = async () => {
    setBusy(true);
    let extra: any = {};
    if (newPass.trim()) {
      extra = { has_password: true, password_hash: await hashPassword(newPass.trim()) };
    }
    const r = await fetch(`/api/admin/links/${form.id}`, {
      method: "PATCH", headers: { ...props.auth, "content-type": "application/json" },
      body: JSON.stringify({
        title: form.title, description: form.description || "", destination_url: form.destination_url,
        slug: form.slug, icon_url: form.icon_url || "", video_url: form.video_url || "",
        expiry_date: form.expiry_date || null, active: form.active, theme: form.theme || "midnight", ...extra,
      }),
    });
    setBusy(false);
    if (r.ok) { props.onSave(form); props.onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-950/60 p-4 backdrop-blur-sm" onClick={props.onClose}>
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 dark:border-night-700 dark:bg-night-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink dark:text-white">Edit Link</h3>
          <button onClick={props.onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
        </div>
        <div className="space-y-3">
          <div><label className="label">Title</label><input value={form.title} onChange={(e) => set("title", e.target.value)} className="field" /></div>
          <div><label className="label">Description</label><input value={form.description || ""} onChange={(e) => set("description", e.target.value)} className="field" /></div>
          <div><label className="label">Destination URL</label><input value={form.destination_url} onChange={(e) => set("destination_url", e.target.value)} className="field" /></div>
          <div><label className="label">Slug</label><input value={form.slug} onChange={(e) => set("slug", e.target.value)} className="field" /></div>
          <div><label className="label">Icon URL</label><input value={form.icon_url || ""} onChange={(e) => set("icon_url", e.target.value)} className="field" /></div>
          <div><label className="label">Video thumbnail URL (YouTube/Vimeo)</label><input value={form.video_url || ""} onChange={(e) => set("video_url", e.target.value)} className="field" placeholder="Paste video link — thumbnail auto-loads" /></div>
          <div>
            <label className="label">Unlock page theme</label>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set("theme", t.id)}
                  className={`flex items-center gap-1.5 rounded-lg border p-2 text-left transition ${(form.theme || "midnight") === t.id
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                      : "border-slate-200 dark:border-night-700"
                    }`}
                >
                  <span className="h-5 w-5 shrink-0 rounded-full" style={{ background: `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]})` }} />
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div><label className="label">Expiry date</label>
            <input type="datetime-local" value={form.expiry_date ? form.expiry_date.slice(0, 16) : ""} onChange={(e) => set("expiry_date", e.target.value ? new Date(e.target.value).toISOString() : null)} className="field" /></div>
          <div><label className="label">New password (leave blank to keep current)</label><input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Set a new unlock password" className="field" /></div>
          <div className="flex gap-2 pt-2">
            <button onClick={save} disabled={busy} className="btn-primary flex-1">{busy ? "Saving…" : "Save"}</button>
            <button onClick={props.onClose} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Analytics View ---------------- */
function AnalyticsView({ links, series }: { links: LinkRow[]; series: any[] }) {
  const rows = [...links].sort((a, b) => (b.views || 0) - (a.views || 0)).map((l) => ({
    ...l, completionRate: l.views ? Math.round(((l.clicks || 0) / l.views) * 100) : 0,
  }));

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink dark:text-white">Analytics</h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Performance breakdown for all unlock links.</p>

      <div className="card mb-6 p-5 dark:border-night-700 dark:bg-night-900">
        <h3 className="font-display text-base font-bold text-ink dark:text-white">Completions trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ background: "#0f1626", border: "1px solid #1f2937", borderRadius: 12 }} labelStyle={{ color: "#e2e8f0" }} />
            <Line type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card overflow-x-auto dark:border-night-700 dark:bg-night-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-night-700 dark:text-slate-400">
              <th className="px-4 py-3">Link</th><th className="px-4 py-3">Views</th><th className="px-4 py-3">Clicks</th>
              <th className="px-4 py-3">Click rate</th><th className="px-4 py-3">Tasks</th><th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-b border-slate-100 dark:border-night-800">
                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">/unlock/{l.slug}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.views || 0}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.clicks || 0}</td>
                <td className="px-4 py-3"><span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{l.completionRate}%</span></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.tasks?.length || 0}</td>
                <td className="px-4 py-3">{l.active ? <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">Active</span> : <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">Inactive</span>}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No data yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Admins View ---------------- */
function AdminsView(props: { admins: AdminRow[]; currentEmail: string; onAdd: (email: string) => void; onRemove: (email: string) => void }) {
  const [email, setEmail] = useState("");
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink dark:text-white">Admins</h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Manage who can access this dashboard.</p>

      <div className="card mb-4 p-5 dark:border-night-700 dark:bg-night-900">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" className="field flex-1" />
          <button onClick={() => { if (email.trim()) { props.onAdd(email.trim()); setEmail(""); } }} className="btn-primary shrink-0">Add Admin</button>
        </div>
        <p className="mt-2 text-xs text-slate-400">The user must also exist in Supabase Auth to sign in.</p>
      </div>

      <div className="card overflow-hidden dark:border-night-700 dark:bg-night-900">
        {props.admins.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">No admins in the list yet. Add one above.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-night-800">
            {props.admins.map((a) => (
              <li key={a.email} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{a.email}</span>
                    {a.email === props.currentEmail && <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">you</span>}
                  </div>
                  <div className="text-xs text-slate-400">Added {new Date(a.created_at).toLocaleDateString()}</div>
                </div>
                <button onClick={() => props.onRemove(a.email)} disabled={a.email === props.currentEmail}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-500/10">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
