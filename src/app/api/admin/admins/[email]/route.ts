import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminEmail } from "@/lib/adminAuth";

export async function DELETE(_req: NextRequest, { params }: { params: { email: string } }) {
  const token = _req.headers.get("authorization")?.replace("Bearer ", "");
  const email = await getAdminEmail(token);
  if (!email || !supabaseAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = supabaseAdmin;

  const target = params.email.toLowerCase();
  // prevent removing yourself
  if (target === email) {
    return NextResponse.json({ error: "You cannot remove yourself." }, { status: 400 });
  }
  const { error } = await db.from("admins").delete().eq("email", target);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
