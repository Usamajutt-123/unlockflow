# Copy this file to .env.local and fill in your Supabase credentials.
# Find these in your Supabase project: Settings -> API

# Optional: your public site URL (used for SEO metadata, sitemap, robots)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Optional: Google Search Console HTML-tag verification code.
# GSC -> Add property -> URL prefix -> HTML tag -> copy ONLY the content value
# of the meta tag (e.g. "abc123xyz") and paste it here.
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=

# Public (anon) — safe to expose to the browser
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here

# SERVER-ONLY. Do NOT expose. Found in Settings -> API -> service_role.
# Needed for the /admin dashboard and admin API routes.
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: an extra admin email (besides those in the admins table)
SUPERADMIN_EMAIL=kazehype407@gmail.com
