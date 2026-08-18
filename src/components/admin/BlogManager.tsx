"use client";
import { useEffect, useState } from "react";
import type { BlogPost } from "@/lib/types";
import { POST_CATEGORIES, POST_TYPES } from "@/lib/types";
import { slugify } from "@/lib/tasks";
import RichTextEditor from "./RichTextEditor";

interface Props {
  token: string;
  auth: any;
}

export default function BlogManager({ token, auth }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [notice, setNotice] = useState("");

  const flash = (m: string) => { setNotice(m); setTimeout(() => setNotice(""), 3000); };

  useEffect(() => {
    fetch("/api/admin/posts", { headers: auth })
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .finally(() => setLoading(false));
  }, [token]);

  const remove = async (slug: string) => {
    if (!confirm("Delete this post?")) return;
    const r = await fetch(`/api/blog/${slug}`, { method: "DELETE", headers: auth });
    if (r.ok) { setPosts((ps) => ps.filter((p) => p.slug !== slug)); flash("Deleted"); }
    else flash("Failed to delete");
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">Blog & Guides</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create and manage posts with a rich-text editor.</p>
        </div>
        <button onClick={() => setEditing({} as BlogPost)} className="btn-primary !py-2 !text-xs">
          + New Post / Guide
        </button>
      </div>

      {notice && <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">{notice}</div>}

      {editing && (
        <PostForm
          initial={editing}
          token={token}
          auth={auth}
          onClose={() => setEditing(null)}
          onSaved={(p) => {
            setPosts((ps) => {
              const exists = ps.some((x) => x.id === p.id);
              return exists ? ps.map((x) => (x.id === p.id ? p : x)) : [p, ...ps];
            });
            setEditing(null);
            flash("Saved");
          }}
        />
      )}

      {loading ? (
        <div className="py-10 text-center text-slate-400">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="card p-10 text-center text-slate-500 dark:border-night-700 dark:bg-night-900 dark:text-slate-400">
          No posts yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="card flex flex-wrap items-center gap-3 p-4 dark:border-night-700 dark:bg-night-900">
              {p.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover_image} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-xl dark:bg-brand-500/10">📄</span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-slate-800 dark:text-slate-100">{p.title}</span>
                  {p.type === "guide" && <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">Guide</span>}
                  {!p.published && <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-night-700 dark:text-slate-300">Draft</span>}
                </div>
                <div className="truncate text-xs text-slate-400">/{p.slug} · {p.category}</div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="btn-ghost !py-1.5 !text-xs">View</a>
                <button onClick={() => setEditing(p)} className="btn-ghost !py-1.5 !text-xs">Edit</button>
                <button onClick={() => remove(p.slug)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
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

function PostForm(props: {
  initial: BlogPost;
  token: string;
  auth: any;
  onClose: () => void;
  onSaved: (p: BlogPost) => void;
}) {
  const [form, setForm] = useState<BlogPost>(() => ({
    id: props.initial.id || "",
    title: props.initial.title || "",
    slug: props.initial.slug || "",
    type: props.initial.type || "post",
    category: props.initial.category || "General",
    excerpt: props.initial.excerpt || "",
    content: props.initial.content || "",
    cover_image: props.initial.cover_image || "",
    gallery: props.initial.gallery || [],
    video_url: props.initial.video_url || "",
    seo_title: props.initial.seo_title || "",
    seo_description: props.initial.seo_description || "",
    author: props.initial.author || "UNLOCKFLOW",
    published: props.initial.published ?? false,
    created_at: props.initial.created_at || "",
    updated_at: props.initial.updated_at || "",
  }));
  const [galleryInput, setGalleryInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const autoSlug = (v: string) => {
    setForm((f) => ({ ...f, title: v, slug: f.slug || slugify(v) }));
  };

  const save = async (publish: boolean) => {
    if (!form.title.trim()) { setErr("Title is required"); return; }
    if (!form.slug.trim()) { setErr("Slug is required"); return; }
    setBusy(true); setErr("");
    const body = { ...form, slug: slugify(form.slug) || slugify(form.title), published: publish };
    const isNew = !form.id;
    const r = await fetch(isNew ? "/api/blog" : `/api/blog/${form.slug}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { ...props.auth, "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    setBusy(false);
    if (r.ok && j.post) { props.onSaved(j.post); }
    else setErr(j.error || "Failed to save");
  };

  const addGallery = () => {
    const url = galleryInput.trim();
    if (!url) return;
    set("gallery", [...(form.gallery || []), url]);
    setGalleryInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-night-950/60 p-4 backdrop-blur-sm" onClick={props.onClose}>
      <div className="card my-6 w-full max-w-3xl p-6 dark:border-night-700 dark:bg-night-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink dark:text-white">
            {form.id ? "Edit" : "New"} {form.type === "guide" ? "Guide" : "Post"}
          </h3>
          <button onClick={props.onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        {err && <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{err}</div>}

        <div className="space-y-3">
          {/* basics */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">Title *</label><input value={form.title} onChange={(e) => autoSlug(e.target.value)} className="field" placeholder="Post title" /></div>
            <div><label className="label">Slug *</label><input value={form.slug} onChange={(e) => set("slug", e.target.value)} className="field" placeholder="my-post" /></div>
            <div>
              <label className="label">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className="field">
                {POST_TYPES.map((t) => <option key={t} value={t}>{t === "guide" ? "Guide" : "Post"}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="field">
                {POST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* cover + video */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">Cover image URL</label><input value={form.cover_image} onChange={(e) => set("cover_image", e.target.value)} className="field" placeholder="https://…/cover.jpg" /></div>
            <div><label className="label">Author</label><input value={form.author} onChange={(e) => set("author", e.target.value)} className="field" /></div>
          </div>
          <div><label className="label">Excerpt (short summary)</label><textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} className="field min-h-[60px]" placeholder="Short description shown on the blog list" /></div>
          <div><label className="label">Featured video URL (optional)</label><input value={form.video_url} onChange={(e) => set("video_url", e.target.value)} className="field" placeholder="https://youtube.com/watch?v=…" /></div>

          {/* rich text editor */}
          <div>
            <label className="label">Content (rich text)</label>
            <RichTextEditor value={form.content} onChange={(html) => set("content", html)} placeholder="Write your article…" />
          </div>

          {/* gallery */}
          <div>
            <label className="label">Gallery images</label>
            <div className="flex gap-2">
              <input value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} className="field flex-1" placeholder="Paste image URL and Add" />
              <button type="button" onClick={addGallery} className="btn-ghost shrink-0 !py-2">Add</button>
            </div>
            {form.gallery.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {form.gallery.map((g, i) => (
                  <span key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    <button type="button" onClick={() => set("gallery", form.gallery.filter((_, x) => x !== i))} className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-night-700 dark:bg-night-800/40">
            <h4 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">SEO</h4>
            <div className="space-y-3">
              <div><label className="label">SEO Title (H1)</label><input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} className="field" placeholder="Title shown in search results" /></div>
              <div><label className="label">SEO Meta Description</label><textarea value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} className="field min-h-[60px]" placeholder="Meta description for search engines" /></div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4" />
              Published
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={() => save(true)} disabled={busy} className="btn-primary flex-1">{busy ? "Saving…" : "Save & Publish"}</button>
            {!form.published && <button onClick={() => save(false)} disabled={busy} className="btn-ghost">Save Draft</button>}
            <button onClick={props.onClose} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
