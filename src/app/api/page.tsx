import PageShell from "@/components/PageShell";
import { Section, P, List, Cards } from "@/components/InfoContent";

export default function ApiPage() {
  return (
    <PageShell
      badge="Resources · API"
      title="API"
      subtitle="Programmatic access to create and manage unlock links, tasks, and completions."
    >
      <Section title="Build on UNLOCKFLOW">
        <P>
          The UNLOCKFLOW API lets developers integrate unlock links into their own apps and workflows. Create links,
          manage tasks, and read completions programmatically.
        </P>
      </Section>

      <Cards
        items={[
          { title: "Links", desc: "Create, read, update, and manage unlock links and their slugs." },
          { title: "Tasks", desc: "Add and organize tasks for any unlock link." },
          { title: "Completions", desc: "Read completion records to power your analytics." },
        ]}
      />

      <Section title="Typical use cases">
        <List
          items={[
            "Generate unlock links from your own dashboard.",
            "Automate reward campaigns at scale.",
            "Sync completion data into your CRM or analytics tools.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
