import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Section, P, Cards } from "@/components/InfoContent";

export const metadata: Metadata = {
  title: "About UNLOCKFLOW",
  description:
    "UNLOCKFLOW is a premium link-unlocking platform built for creators who want to turn simple links into meaningful audience engagement.",
  openGraph: {
    title: "About UNLOCKFLOW",
    description:
      "Learn how UNLOCKFLOW helps creators build engaging unlock experiences and turn audience attention into meaningful engagement.",
  },
};

export default function AboutPage() {
  return (
    <PageShell
      badge="Company · About"
      title="About UNLOCKFLOW"
      subtitle="UNLOCKFLOW is a premium link-unlocking platform built for creators who want to turn simple links into meaningful audience engagement."
    >
      <Section title="Our Mission">
        <P>
          Growing an audience takes time, effort, and consistency. UNLOCKFLOW makes it easier for creators to build
          engaging unlock experiences without requiring visitors to create accounts or navigate complicated systems.
        </P>
        <P>
          Create your link, choose the tasks your audience should complete, add your destination, and share it anywhere.
          UNLOCKFLOW handles the unlock experience from there.
        </P>
      </Section>

      <Section title="Built for Creators">
        <P>
          UNLOCKFLOW is designed for YouTubers, streamers, social media creators, communities, marketers, and anyone who
          wants to connect audience engagement with digital rewards.
        </P>
      </Section>

      <Section title="How UNLOCKFLOW Works">
        <Cards
          items={[
            {
              title: "1. Create",
              desc: "Select the tasks you want visitors to complete and add your destination URL.",
            },
            {
              title: "2. Customize",
              desc: "Personalize your unlock page with optional titles, descriptions, images, banners, passwords, expiry dates, custom slugs, and other available settings.",
            },
            {
              title: "3. Share",
              desc: "Share your generated unlock link or QR code anywhere your audience can access it.",
            },
            {
              title: "4. Unlock",
              desc: "Visitors complete the selected tasks and unlock the destination you provided.",
            },
          ]}
        />
      </Section>

      <Section title="Our Principles">
        <Cards
          items={[
            { title: "Simple", desc: "No complicated setup or unnecessary steps." },
            { title: "Creator-first", desc: "Built around the needs of modern creators and online communities." },
            { title: "Fast", desc: "Designed to provide a responsive experience across desktop and mobile." },
            { title: "Transparent", desc: "Clear task flows and straightforward controls." },
          ]}
        />
      </Section>

      <Section title="Our Goal">
        <P>
          Our goal is simple: give creators a better way to turn audience attention into meaningful engagement while
          keeping the experience fast, simple, and professional.
        </P>
      </Section>
    </PageShell>
  );
}
