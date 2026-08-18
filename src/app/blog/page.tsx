"use client";
import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import type { BlogPost } from "@/lib/types";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [type, setType] = useState<"all" | "post" | "guide">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = type === "all" ? "" : `?type=${type}`;
    fetch(`/api/blog${q}`)
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <PageShell
      badge="Blog & Guides"
      title="Blog & Guides"
      subtitle="Guides, tips, and stories to help creators grow their audience."
    >
      {/* filter */}
      <div className="mb-6 flex gap-2">
        {(["all", "post", "guide"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
              type === t ? "bg-brand-600 text-white shadow-glow" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-brand-600 dark:bg-night-900 dark:text-slate-300 dark:ring-night-700"
            }`}
          >
            {t === "all" ? "All" : t === "guide" ? "Guides" : "Posts"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-10 text-center text-slate-400">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 dark:border-night-700 dark:bg-night-900 dark:text-slate-400">
          No {type === "all" ? "posts" : type + "s"} yet. Check back soon!
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {posts.map((p) => (
            <a
              key={p.id}
              href={`/blog/${p.slug}`}
              className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-glow dark:border-night-700 dark:bg-night-900"
            >
              {p.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover_image} alt={p.title} className="h-44 w-full object-cover transition group-hover:scale-105" />
              ) : (
                <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-brand-600 to-purple-700 text-white">
                  <span className="text-4xl">{p.type === "guide" ? "📘" : "📰"}</span>
                </div>
              )}
              <div className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{p.category}</span>
                  {p.type === "guide" && <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">Guide</span>}
                </div>
                <h3 className="font-display text-lg font-bold text-ink group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">{p.title}</h3>
                {p.excerpt && <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{p.excerpt}</p>}
                <div className="mt-3 text-xs text-slate-400">
                  {p.author} · {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </PageShell>
  );
}
