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
  const missingViews = rows.some((l: any) => !Number(l.views));
  if (missingViews && rows.length) {
    const { data: daily } = await supabaseAdmin.from("link_analytics").select("link_id, views");
    const byLink: Record<string, number> = {};
    (daily || []).forEach((r: any) => {
      const id = String(r.link_id);
      byLink[id] = (byLink[id] || 0) + (Number(r.views) || 0);
    });
    rows.forEach((l: any) => {
      const fromDaily = byLink[String(l.id)] || 0;
      l.views = Math.max(Number(l.views) || 0, fromDaily);
    });
  }

  return NextResponse.json({ links: rows });
}
