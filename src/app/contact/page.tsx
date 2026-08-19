import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Section, Cards } from "@/components/InfoContent";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Questions, feedback, or partnerships — get in touch with the UNLOCKFLOW team. We reply within 24 hours.",
  openGraph: {
    title: "Contact UNLOCKFLOW",
    description:
      "Questions, feedback, or partnerships — we'd love to hear from you. Contact the UNLOCKFLOW team today.",
  },
};

export default function ContactPage() {
  return (
    <PageShell
      badge="Company · Contact"
      title="Contact Us"
      subtitle="Questions, feedback, or partnerships — we'd love to hear from you."
    >
      <Cards
        items={[
          { title: "Email", desc: "support@unlockflow.com — we reply within 24 hours." },
          { title: "Partnerships", desc: "partners@unlockflow.com — let's grow together." },
          { title: "Press", desc: "press@unlockflow.com — for media and interviews." },
        ]}
      />

      <Section title="Send us a message">
        <div className="card mt-4 p-6 dark:border-night-700 dark:bg-night-900">
          <ContactForm />
        </div>
      </Section>
    </PageShell>
  );
}
