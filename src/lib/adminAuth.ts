import { supabaseAdmin } from "./supabaseAdmin";

// Verify an access token and check whether the user is an admin.
// Returns the admin email if valid, otherwise null.
export async function getAdminEmail(token: string | null | undefined): Promise<string | null> {
  if (!token || !supabaseAdmin) return null;

  const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !userData?.user?.email) return null;

  const email = userData.user.email.toLowerCase();

  // Look the user up in the admins table (service role bypasses RLS).
  const { data: admin, error: adminErr } = await supabaseAdmin
    .from("admins")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (adminErr) return null;
  if (admin) return email;

  // Fallback: allow an email set via env var (SUPERADMIN_EMAIL) as an extra admin.
  const superAdmin = process.env.SUPERADMIN_EMAIL?.toLowerCase();
  if (superAdmin && email === superAdmin) return email;

  return null;
}
