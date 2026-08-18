"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import PageShell from "@/components/PageShell";
import type { BlogPost } from "@/lib/types";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/blog/${params.slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.post) setPost(d.post);
        else setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <PageShell badge="Loading" title="…">
        <div className="py-10 text-center text-slate-400">Loading…</div>
      </PageShell>
    );
  }

  if (notFound || !post) {
    return (
      <PageShell badge="Not found" title="Post not found">
        <div className="card p-12 text-center text-slate-500 dark:border-night-700 dark:bg-night-900">
          This post doesn't exist or isn't published yet.
        </div>
      </PageShell>
    );
  }

  const video = post.video_url || "";

  return (
    <>
    <Head>
      <title>{post.title} | UNLOCKFLOW</title>
      <meta name="description" content={post.seo_description || post.excerpt} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.seo_description || post.excerpt} />
      {post.cover_image && <meta property="og:image" content={post.cover_image} />}
    </Head>
    <PageShell badge={post.type === "guide" ? "Guide" : "Post"} title={post.title} subtitle={post.seo_description || post.excerpt}>
      {/* meta */}
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span className="rounded bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{post.category}</span>
        <span>{post.author}</span>
        <span>·</span>
        <span>{new Date(post.created_at).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" })}</span>
      </div>

      {/* cover */}
      {post.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover_image} alt={post.title} className="w-full rounded-2xl object-cover shadow-lg" />
      )}

      {/* featured video */}
      {video && (
        <div className="mt-5 aspect-video w-full overflow-hidden rounded-2xl shadow-lg">
          <iframe
            className="h-full w-full"
            src={video.includes("embed") ? video : `https://www.youtube.com/embed/${video.match(/(?:watch\?v=|youtu\.be\/)([\w-]+)/)?.[1] || ""}`}
            allowFullScreen
            frameBorder="0"
          />
        </div>
      )}

      {/* body */}
      <article
        className="blog-body mt-8"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* gallery */}
      {post.gallery && post.gallery.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 font-display text-xl font-bold text-ink dark:text-white">Gallery</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {post.gallery.map((g, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={g} alt="" className="h-48 w-full rounded-xl object-cover" />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <a href="/blog" className="btn-ghost">← Back to Blog</a>
      </div>
    </PageShell>
    </>
  );
}
