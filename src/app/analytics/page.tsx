import PageShell from "@/components/PageShell";
import { Section, P, List, Cards } from "@/components/InfoContent";

export default function AnalyticsPage() {
  return (
    <PageShell
      badge="Product · Analytics"
      title="Analytics"
      subtitle="Understand how your unlock links perform and turn engagement into insight."
    >
      <Section title="Know what's working">
        <P>
          Every task completion is recorded so you can see exactly how your audience interacts with your unlock links.
          Track completions and engagement at a glance.
        </P>
      </Section>

      <Cards
        items={[
          { title: "Task Completions", desc: "See how many visitors completed each unlock link." },
          { title: "Engagement Insights", desc: "Understand which tasks your audience actually finishes." },
          { title: "Progress Tracking", desc: "Follow each visitor's progress through your task list." },
        ]}
      />

      <Section title="Why it matters">
        <List
          items={[
            "Optimize which tasks convert best.",
            "Identify links that need attention.",
            "Measure the real value of your reward campaigns.",
            "Make data-driven decisions for growth.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
