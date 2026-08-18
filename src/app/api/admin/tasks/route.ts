import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminEmail } from "@/lib/adminAuth";

// Reorder tasks: body = { link_id, orderedIds: string[] }
export async function PATCH(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const email = await getAdminEmail(token);
  if (!email || !supabaseAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = supabaseAdmin;

  const { link_id, orderedIds } = await req.json().catch(() => ({}));
  if (!link_id || !Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "link_id and orderedIds required" }, { status: 400 });
  }

  // Update position sequentially
  const updates = orderedIds.map((id: string, i: number) =>
    db.from("tasks").update({ position: i }).eq("id", id).eq("link_id", link_id)
  );
  const results = await Promise.all(updates);
  const err = results.find((r) => r.error);
  if (err?.error) return NextResponse.json({ error: err.error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// Add task: body = { link_id, task_type, label, task_url }
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const email = await getAdminEmail(token);
  if (!email || !supabaseAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = supabaseAdmin;

  const { link_id, task_type, label, task_url } = await req.json().catch(() => ({}));
  if (!link_id || !label || !task_url) {
    return NextResponse.json({ error: "link_id, label, task_url required" }, { status: 400 });
  }

  // compute next position
  const { count } = await db
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("link_id", link_id);
  const position = count ?? 0;

  const { data, error } = await db
    .from("tasks")
    .insert({ link_id, task_type: task_type || "custom", label, task_url, position })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}
