import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://unlockflow.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "", "/blog", "/task-library", "/qr-codes", "/advanced-options", "/analytics",
    "/help", "/docs", "/about", "/privacy", "/terms", "/contact", "/careers",
  ];
  return staticPages.map((p) => ({
    url: base + p,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
}