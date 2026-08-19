import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task Library",
  description: "20+ smart tasks across every major platform to help your audience engage and unlock their reward.",
};
import PageShell from "@/components/PageShell";
import { Section, P, List, Cards } from "@/components/InfoContent";

export default function TaskLibraryPage() {
  return (
    <PageShell
      badge="Product · Task Library"
      title="Task Library"
      subtitle="20+ smart tasks across every major platform to help your audience engage and unlock their reward."
    >
      <Section title="Every platform you need">
        <P>
          UNLOCKFLOW ships with a ready-made library of tasks covering the platforms your audience already uses.
          Add any task to an unlock link in one click — no setup required.
        </P>
      </Section>

      <Cards
        items={[
          { title: "YouTube", desc: "Subscribe, Add Channel, Subscribe & Like, Subscribe & Bell, Like, Comment, Like & Comment." },
          { title: "Instagram", desc: "Followers, Post Like, Story View." },
          { title: "Facebook", desc: "Followers, Like Post, Group Join." },
          { title: "Telegram", desc: "Telegram Member join." },
          { title: "WhatsApp", desc: "WhatsApp Channel Join." },
          { title: "TikTok", desc: "TikTok Follow and Like Video." },
          { title: "Discord", desc: "Join Discord Server." },
          { title: "Twitter", desc: "Follow on Twitter." },
          { title: "Custom", desc: "Add any custom task with your own name and link." },
        ]}
      />

      <Section title="How it works">
        <List
          items={[
            "Open the Link Generator and click a task from the library.",
            "Paste your link and press Enter — the task is added.",
            "Add as many tasks as you like, then generate your unlock link.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
