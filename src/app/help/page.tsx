import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Quick answers to the most common questions about UNLOCKFLOW.",
};
import PageShell from "@/components/PageShell";
import { Section, P, List } from "@/components/InfoContent";

export default function HelpPage() {
  return (
    <PageShell
      badge="Resources · Help Center"
      title="Help Center"
      subtitle="Quick answers to the most common questions about UNLOCKFLOW."
    >
      <Section title="Getting started">
        <List
          items={[
            "Open the Link Generator on the home page.",
            "Click a task from the library and paste your link.",
            "Add your destination (reward) link and optional advanced settings.",
            "Click Generate Link to create your unlock link and QR code.",
          ]}
        />
      </Section>

      <Section title="Do visitors need an account?">
        <P>
          No. UNLOCKFLOW is fully public and login-free. Anyone with the link can complete your tasks and unlock the
          reward instantly.
        </P>
      </Section>

      <Section title="How do passwords work?">
        <P>
          In Advanced Options you can set a password. Visitors must enter it before the reward opens after completing
          all tasks. This is great for VIP or exclusive rewards.
        </P>
      </Section>

      <Section title="Still need help?">
        <P>
          Contact our support team from the <a href="/contact" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Contact page</a> — we're happy to help.
        </P>
      </Section>
    </PageShell>
  );
}
