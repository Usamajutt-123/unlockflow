import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminEmail } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const email = await getAdminEmail(token);
  if (!email || !supabaseAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = supabaseAdmin;

  // Bounded daily aggregates: max one row per link per day.
  const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const { data, error } = await db
    .from("link_analytics")
    .select("day, views, clicks, completions")
    .gte("day", since);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Bucket by day over the last 14 days
  const buckets: Record<string, { completions: number; views: number; clicks: number }> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { completions: 0, views: 0, clicks: 0 };
  }
  (data || []).forEach((r: any) => {
    const key = String(r.day).slice(0, 10);
    if (buckets[key]) {
      buckets[key].completions += r.completions || 0;
      buckets[key].views += r.views || 0;
      buckets[key].clicks += r.clicks || 0;
    }
  });

  const series = Object.entries(buckets).map(([date, v]) => ({
    date,
    label: new Date(date + "T00:00:00").toLocaleDateString("en", { month: "short", day: "numeric" }),
    completions: v.completions,
    views: v.views,
    clicks: v.clicks,
  }));

  return NextResponse.json({ series });
}
