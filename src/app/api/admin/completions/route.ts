import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminEmail } from "@/lib/adminAuth";

// Recent activity from compact daily aggregates (no per-completion rows).
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const email = await getAdminEmail(token);
  if (!email || !supabaseAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = supabaseAdmin;

  const since = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  const { data, error } = await db
    .from("link_analytics")
    .select("link_id, day, completions")
    .gte("day", since)
    .gt("completions", 0)
    .order("day", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const linkIds = [...new Set((data || []).map((r: any) => r.link_id))];
  let slugMap: Record<string, string> = {};
  if (linkIds.length) {
    const { data: links } = await db.from("links").select("id, slug").in("id", linkIds);
    (links || []).forEach((l: any) => (slugMap[l.id] = l.slug));
  }

  const rows = (data || []).map((r: any) => ({
    id: r.link_id + ":" + r.day,
    linkId: r.link_id,
    slug: slugMap[r.link_id] || "deleted",
    completions: r.completions,
    day: r.day,
  }));

  return NextResponse.json({ completions: rows });
}
