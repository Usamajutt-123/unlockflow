import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: "../fonts/inter-latin-wght.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

const sora = localFont({
  src: "../fonts/sora-latin-wght.woff2",
  variable: "--font-sora",
  display: "swap",
  weight: "100 800",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://unlockflow.vercel.app";

// Google Search Console HTML-tag verification code (optional).
// Paste the content of the google-site-verification meta tag here or,
// better, set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in Vercel env vars.
const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: GOOGLE_VERIFICATION
    ? { google: GOOGLE_VERIFICATION }
    : undefined,
  title: {
    default: "UNLOCKFLOW — Create Unlock Links in 30 Seconds, No Signup",
    template: "%s | UNLOCKFLOW",
  },
  description:
    "Create premium unlock links in 30 seconds — no signup required. Visitors complete your tasks (subscribe, follow, join) and instantly unlock their reward. Free, no login, 20+ smart tasks.",
  applicationName: "UNLOCKFLOW",
  keywords: [
    "unlock link", "link unlock", "task unlock", "reward link", "youtube grow",
    "instagram followers", "engagement", "link shortener", "premium link",
  ],
  authors: [{ name: "UNLOCKFLOW" }],
  category: "Productivity",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "UNLOCKFLOW",
    title: "UNLOCKFLOW — Create Unlock Links in 30 Seconds, No Signup",
    description:
      "Create premium unlock links in 30 seconds — no signup required. Visitors complete your tasks and instantly unlock their reward.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "UNLOCKFLOW" }],
  },
  twitter: {
    card: "summary",
    title: "UNLOCKFLOW — Create Unlock Links in 30 Seconds",
    description:
      "Create premium unlock links in 30 seconds — no signup required. Free, no login.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/icon-192.png", sizes: "180x180", type: "image/png" },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UNLOCKFLOW",
  },
};

export const viewport: Viewport = {
  themeColor: "#1d4ff0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('uf_theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
