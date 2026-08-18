import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminEmail } from "@/lib/adminAuth";

// Public: list published posts (optionally filtered by type)
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") || null;
  const category = req.nextUrl.searchParams.get("category") || null;

  if (!supabaseAdmin) return NextResponse.json({ posts: [], error: "not configured" });

  let q = supabaseAdmin
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (type) q = q.eq("type", type);
  if (category) q = q.eq("category", category);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data || [] });
}

// Admin: create a post
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const email = await getAdminEmail(token);
  if (!email || !supabaseAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = supabaseAdmin;

  const body = await req.json().catch(() => ({}));
  const { title, slug, type, category, excerpt, content, cover_image, gallery, video_url, seo_title, seo_description, author, published } = body;

  if (!title || !slug) return NextResponse.json({ error: "title and slug required" }, { status: 400 });

  const { data, error } = await db
    .from("blog_posts")
    .insert({
      title, slug, type: type || "post", category: category || "General",
      excerpt: excerpt || "", content: content || "", cover_image: cover_image || "",
      gallery: gallery || [], video_url: video_url || "", seo_title: seo_title || "",
      seo_description: seo_description || "", author: author || "UNLOCKFLOW", published: !!published,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}
