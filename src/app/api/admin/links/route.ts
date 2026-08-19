import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminEmail } from "@/lib/adminAuth";

// GET all links with their tasks + completion counts
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const email = await getAdminEmail(token);
  if (!email || !supabaseAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: links, error } = await supabaseAdmin
    .from("links")
    .select("*, tasks(*)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = links || [];
  // If counters on the links table are missing/zero, fill them from daily aggregates.
  const missingCounters = rows.some((l: any) => !Number(l.views) || !Number(l.clicks) || !Number(l.completions));
  if (missingCounters && rows.length) {
    const { data: daily, error: dailyErr } = await supabaseAdmin
      .from("link_analytics")
      .select("link_id, views, clicks, completions");
    if (dailyErr) {
      console.warn("[links] link_analytics unavailable:", dailyErr.message);
    } else {
      const byLink: Record<string, { views: number; clicks: number; completions: number }> = {};
      (daily || []).forEach((r: any) => {
        const id = String(r.link_id);
        byLink[id] = {
          views: (byLink[id]?.views || 0) + (Number(r.views) || 0),
          clicks: (byLink[id]?.clicks || 0) + (Number(r.clicks) || 0),
          completions: (byLink[id]?.completions || 0) + (Number(r.completions) || 0),
        };
      });
      rows.forEach((l: any) => {
        const fromDaily = byLink[String(l.id)];
        if (!fromDaily) return;
        l.views = Math.max(Number(l.views) || 0, fromDaily.views);
        l.clicks = Math.max(Number(l.clicks) || 0, fromDaily.clicks);
        l.completions = Math.max(Number(l.completions) || 0, fromDaily.completions);
      });
    }
  }

  return NextResponse.json({ links: rows });
}