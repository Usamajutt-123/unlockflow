"use client";
import { useEffect, useState } from "react";
import type { BlogPost } from "@/lib/types";

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then((d) => setPosts((d.posts || []).slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="blog" className="relative py-20 sm:py-24">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">From the Blog</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink dark:text-white sm:text-4xl">
              Latest articles &amp; guides
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Tips, guides and ideas to help you grow your audience with unlock links.
            </p>
          </div>
          <a href="/blog" className="btn-ghost">
            View all posts
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card h-64 animate-pulse dark:border-night-700 dark:bg-night-900" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="card mt-10 p-12 text-center text-slate-500 dark:border-night-700 dark:bg-night-900 dark:text-slate-400">
            No posts published yet. Check back soon!
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {posts.map((p) => (
              <a
                key={p.id}
                href={`/blog/${p.slug}`}
                className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-glow dark:border-night-700 dark:bg-night-900"
              >
                {p.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_image} alt={p.title} loading="lazy" decoding="async" className="h-40 w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-brand-600 to-purple-700 text-white">
                    <span className="text-4xl">{p.type === "guide" ? "📘" : "📰"}</span>
                  </div>
                )}
                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{p.category}</span>
                    {p.type === "guide" && <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">Guide</span>}
                  </div>
                  <h3 className="font-display text-base font-bold text-ink group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{p.excerpt}</p>}
                  <div className="mt-3 text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString()}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
