import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminEmail } from "@/lib/adminAuth";

type Ctx = { params: { id: string } };

// Admin: update an ad
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const email = await getAdminEmail(token);
  if (!email || !supabaseAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  // Whitelist fields so only ad fields can be updated.
  const patch: Record<string, any> = {};
  if (typeof body.slot === "string" && ["banner", "task", "task_center", "above_unlock", "faq", "social"].includes(body.slot)) patch.slot = body.slot;
  if (typeof body.title === "string") patch.title = String(body.title).trim();
  if (typeof body.image_url === "string") patch.image_url = String(body.image_url).trim();
  if (typeof body.link_url === "string") patch.link_url = String(body.link_url).trim();
  if (typeof body.type === "string" && ["image", "script"].includes(body.type)) patch.type = body.type;
  if (typeof body.script === "string") patch.script = body.script;
  if (typeof body.active === "boolean") patch.active = body.active;

  const { data, error } = await supabaseAdmin
    .from("ads")
    .update(patch)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ad: data });
}

// Admin: delete an ad
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const token = _req.headers.get("authorization")?.replace("Bearer ", "");
  const email = await getAdminEmail(token);
  if (!email || !supabaseAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabaseAdmin.from("ads").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
