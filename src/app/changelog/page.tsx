import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Section, P } from "@/components/InfoContent";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's new in UNLOCKFLOW — recent updates and improvements.",
  openGraph: {
    title: "Changelog | UNLOCKFLOW",
    description: "Recent updates and improvements to UNLOCKFLOW.",
  },
};

export default function ChangelogPage() {
  return (
    <PageShell
      badge="Resources · Changelog"
      title="Changelog"
      subtitle="What's new in UNLOCKFLOW — recent updates and improvements."
    >
      <Section title="v1.0 — Launch">
        <P>
          The first public release of UNLOCKFLOW. Create premium unlock links with 20+ tasks, advanced options,
          password protection, expiry dates, custom slugs, and automatic QR codes.
        </P>
      </Section>

      <Section title="Dark Mode">
        <P>
          Added a fully themed dark mode with a theme toggle, saved preference, and flash-free loading.
        </P>
      </Section>

      <Section title="Premium Animated Background">
        <P>
          Added animated gradient orbs, floating particles, and a subtle grid overlay across the site and unlock pages.
        </P>
      </Section>

      <Section title="Multiple Task Inputs">
        <P>
          Each task now opens its own input, so you can add many tasks at once — including custom-named tasks with both
          a name and a link.
        </P>
      </Section>
    </PageShell>
  );
}
