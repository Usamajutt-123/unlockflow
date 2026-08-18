import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminEmail } from "@/lib/adminAuth";

// GET list of admins
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const email = await getAdminEmail(token);
  if (!email || !supabaseAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = supabaseAdmin;

  const { data, error } = await db.from("admins").select("email, created_at").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ admins: data || [] });
}

// POST add admin: { email }
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const email = await getAdminEmail(token);
  if (!email || !supabaseAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = supabaseAdmin;

  const { email: newEmail } = await req.json().catch(() => ({}));
  if (!newEmail || !newEmail.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  const { data, error } = await db
    .from("admins")
    .upsert({ email: newEmail.toLowerCase() }, { onConflict: "email" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ admin: data });
}
