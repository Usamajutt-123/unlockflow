import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Section, P, List, Cards } from "@/components/InfoContent";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Everything you need to know to get the most out of UNLOCKFLOW — quick start, adding tasks, password protection, expiry dates, and configuration.",
  openGraph: {
    title: "UNLOCKFLOW Documentation",
    description:
      "Quick start guide, tasks, password protection, expiry dates, and configuration for your unlock links.",
  },
};

export default function DocsPage() {
  return (
    <PageShell
      badge="Resources · Documentation"
      title="Documentation"
      subtitle="Everything you need to know to get the most out of UNLOCKFLOW."
    >
      <Section title="Quick start">
        <List
          items={[
            "Go to the Link Generator.",
            "Click tasks to open inputs, paste links, and press Enter.",
            "Enter your destination reward link.",
            "Optionally open Advanced Options to customize.",
            "Click Generate Link — copy the link or save the QR code.",
          ]}
        />
      </Section>

      <Cards
        items={[
          { title: "Adding Tasks", desc: "Add one or many tasks per link. Use the same task multiple times for multiple links." },
          { title: "Custom Tasks", desc: "Give a custom task a name and link for any action you invent." },
          { title: "Password Protection", desc: "Set a password in Advanced Options to gate the reward." },
          { title: "Expiry Dates", desc: "Limit how long a link stays active with an automatic expiry." },
        ]}
      />

      <Section title="Configuration">
        <P>
          UNLOCKFLOW uses Supabase for storage. See the project README for setting up your database schema and
          environment variables, then deploy to Vercel with a single push.
        </P>
      </Section>
    </PageShell>
  );
}
