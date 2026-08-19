import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Section, P, List } from "@/components/InfoContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How UNLOCKFLOW handles your data and the data of your visitors — minimal by default, you own your links, tasks, and completion records.",
  openGraph: {
    title: "Privacy Policy | UNLOCKFLOW",
    description:
      "UNLOCKFLOW is designed to be minimal by default. Learn what we collect, how we use data, and your control over it.",
  },
};

export default function PrivacyPage() {
  return (
    <PageShell
      badge="Company · Privacy"
      title="Privacy Policy"
      subtitle="How UNLOCKFLOW handles your data and the data of your visitors."
    >
      <Section title="What we collect">
        <P>
          UNLOCKFLOW is designed to be minimal by default. We store the links, tasks, and completion records you create
          in your own database. Visitors do not need an account.
        </P>
      </Section>

      <Section title="How we use data">
        <List
          items={[
            "To power your unlock links and task flows.",
            "To track task completions for your analytics.",
            "To provide technical support and improve the product.",
          ]}
        />
      </Section>

      <Section title="Cookies & storage">
        <P>
          We use a small amount of browser storage (localStorage) to remember your theme preference and the tasks a
          visitor has completed on an unlock page. This keeps the experience seamless without accounts.
        </P>
      </Section>

      <Section title="Your control">
        <P>
          You own your data. Delete any link and its data at any time through your database, and visitors can clear
          their browser storage at any time.
        </P>
      </Section>
    </PageShell>
  );
}
