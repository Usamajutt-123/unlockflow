import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminEmail } from "@/lib/adminAuth";

const SLOTS = ["banner", "task", "bottom"];

// Admin: list all ads
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const email = await getAdminEmail(token);
  if (!email || !supabaseAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("ads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ads: data || [] });
}

// Admin: create an ad
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const email = await getAdminEmail(token);
  if (!email || !supabaseAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const slot = SLOTS.includes(body.slot) ? body.slot : "banner";
  const title = String(body.title || "").trim();
  const image_url = String(body.image_url || "").trim();
  const link_url = String(body.link_url || "").trim();

  if (!title && !image_url) {
    return NextResponse.json({ error: "Add a title or an image URL" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("ads")
    .insert({ slot, title, image_url, link_url, active: body.active !== false })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ad: data });
}
