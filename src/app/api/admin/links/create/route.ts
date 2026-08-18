import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminEmail } from "@/lib/adminAuth";
import { randomSlug, slugify } from "@/lib/tasks";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const email = await getAdminEmail(token);
  if (!email || !supabaseAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = supabaseAdmin;

  const { title, description, destination_url, customSlug, icon_url } = await req.json().catch(() => ({}));
  if (!destination_url || !/^https?:\/\//.test(destination_url)) {
    return NextResponse.json({ error: "Valid destination URL required" }, { status: 400 });
  }

  const slug = customSlug ? slugify(customSlug) || randomSlug() : randomSlug();

  const { data, error } = await db
    .from("links")
    .insert({
      slug,
      title: title || "Your reward is ready",
      description: description || "",
      destination_url,
      icon_url: icon_url || "",
      has_password: false,
      active: true,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ link: data });
}
