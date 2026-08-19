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

  // Pull links and sum counters client-side (service role).
  // `views` + `clicks` columns come from migration 0002, `completions` from 0003.
  // We try the full set first; if a column is missing we degrade gracefully instead of 500.
  let rows: any[] = [];
  let totalViews = 0, totalClicks = 0, totalCompletions = 0;
  {
    const r = await db.from("links").select("views, clicks, completions");
    if (r.error) {
      // `completions` likely missing (pre-0003) — try without it.
      const r2 = await db.from("links").select("views, clicks");
      if (r2.error) {
        // `views` likely missing (pre-0002) — everything stays 0.
        console.warn("[stats] links counters unavailable:", r2.error.message);
      } else {
        rows = r2.data || [];
        totalViews = rows.reduce((s, row) => s + (Number(row.views) || 0), 0);
        totalClicks = rows.reduce((s, row) => s + (Number(row.clicks) || 0), 0);
      }
    } else {
      rows = r.data || [];
      totalViews = rows.reduce((s, row) => s + (Number(row.views) || 0), 0);
      totalClicks = rows.reduce((s, row) => s + (Number(row.clicks) || 0), 0);
      totalCompletions = rows.reduce((s, row) => s + (Number(row.completions) || 0), 0);
    }
  }

  // If views are 0 from the links table, try daily aggregates (migration 0003).
  if (totalViews === 0) {
    const { data: daily, error: dailyErr } = await db.from("link_analytics").select("views");
    if (dailyErr) {
      console.warn("[stats] link_analytics unavailable (migration 0003 not applied?):", dailyErr.message);
    } else {
      totalViews = (daily || []).reduce((s, row) => s + (Number(row.views) || 0), 0);
    }
  }

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