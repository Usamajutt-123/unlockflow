import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Public: list active ads for the unlock page (grouped by slot).
// Returns an empty array when Supabase isn't configured so the page
// renders gracefully without ads.
export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ ads: [] });

  const { data, error } = await supabaseAdmin
    .from("ads")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    // e.g. "relation ads does not exist" when migration 0007 hasn't run.
    return NextResponse.json({ ads: [], error: error.message });
  }

  const ads = (data || []).map((a: any) => ({
    id: a.id,
    slot: a.slot,
    title: a.title || "",
    image_url: a.image_url || "",
    link_url: a.link_url || "",
    active: a.active,
    created_at: a.created_at,
  }));

  return NextResponse.json({ ads });
}
