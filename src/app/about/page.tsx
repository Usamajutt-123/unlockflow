import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Section, P, Cards } from "@/components/InfoContent";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "UNLOCKFLOW helps creators turn their audience into engaged fans with premium, automated unlock links. No signup, no login — just growth.",
  openGraph: {
    title: "About UNLOCKFLOW",
    description:
      "We help creators turn their audience into engaged fans with premium, automated unlock links — free, no login required.",
  },
};

export default function AboutPage() {
  return (
    <PageShell
      badge="Company · About"
      title="About UNLOCKFLOW"
      subtitle="We help creators turn their audience into engaged fans — with premium, automated unlock links."
    >
      <Section title="Our mission">
        <P>
          Growing an audience is hard. UNLOCKFLOW exists to make engagement effortless: a creator builds a link,
          visitors complete a few simple tasks, and everyone gets what they want. No logins, no friction, no complexity.
        </P>
      </Section>

      <Cards
        items={[
          { title: "Creator-first", desc: "Built for YouTubers, streamers, and content creators who want real engagement." },
          { title: "Premium by default", desc: "A polished, beautiful experience on every page and unlock flow." },
          { title: "Automated", desc: "Hands-free once your link is built — the system does the rest." },
          { title: "Open & private", desc: "No login for visitors, and you own your data in your own database." },
        ]}
      />
    </PageShell>
  );
}
