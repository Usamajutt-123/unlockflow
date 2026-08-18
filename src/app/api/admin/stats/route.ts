import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminEmail } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const email = await getAdminEmail(token);
  if (!email || !supabaseAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = supabaseAdmin;

  // Pull links and sum counters client-side (service role) — no separate analytics RPC needed.
  const { data: links, error } = await db
    .from("links")
    .select("views, clicks, completions");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = links || [];
  const totalViews = rows.reduce((s: number, r: any) => s + (r.views || 0), 0);
  const totalClicks = rows.reduce((s: number, r: any) => s + (r.clicks || 0), 0);
  const totalCompletions = rows.reduce((s: number, r: any) => s + (r.completions || 0), 0);

  // tasks count
  const { count: taskCount } = await db
    .from("tasks")
    .select("id", { count: "exact", head: true });

  return NextResponse.json({
    totals: {
      links: rows.length,
      views: totalViews,
      clicks: totalClicks,
      completions: totalCompletions,
      tasks: taskCount ?? 0,
    },
  });
}
