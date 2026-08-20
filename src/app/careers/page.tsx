import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Section, P } from "@/components/InfoContent";

export const metadata: Metadata = {
  title: "Careers at UNLOCKFLOW",
  description:
    "We're building tools that make creator engagement simpler, faster, and more useful. Learn more about working with UNLOCKFLOW.",
  openGraph: {
    title: "Careers at UNLOCKFLOW",
    description:
      "We're building tools that make creator engagement simpler, faster, and more useful.",
  },
};

export default function CareersPage() {
  return (
    <PageShell
      badge="Company · Careers"
      title="Careers at UNLOCKFLOW"
      subtitle="We're building tools that make creator engagement simpler, faster, and more useful."
    >
      <Section title="Hiring Status">
        <P>
          We're not actively hiring right now. UNLOCKFLOW is currently focused on building and improving the platform.
        </P>
        <P>
          If you believe you can contribute something exceptional, you're welcome to contact us and tell us what you
          would bring to the team.
        </P>
      </Section>

      <Section title="Get in touch">
        <P>
          Interested in working with us in the future? Send us a note from the{" "}
          <a href="/contact" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Contact page</a>{" "}
          and share what you would bring to the team.
        </P>
      </Section>
    </PageShell>
  );
}
