import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Section, P, Cards } from "@/components/InfoContent";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact UNLOCKFLOW",
  description:
    "Have a question, found a problem, or want to discuss a partnership? Reach out to the UNLOCKFLOW team through the contact form.",
  openGraph: {
    title: "Contact UNLOCKFLOW",
    description:
      "Have a question, found a problem, or want to discuss a partnership? Get in touch with the UNLOCKFLOW team.",
  },
};

export default function ContactPage() {
  return (
    <PageShell
      badge="Company · Contact"
      title="Contact UNLOCKFLOW"
      subtitle="Have a question, found a problem, or want to discuss a partnership? We're here to help."
    >
      <Cards
        items={[
          { title: "Support", desc: "For technical issues, broken links, unlock-flow problems, or general questions." },
          { title: "Partnerships", desc: "For business, advertising, creator, or partnership opportunities." },
          { title: "Press", desc: "For media inquiries and press-related requests." },
        ]}
      />

      <Section title="Get in touch">
        <P>
          You can also reach us directly by email at{" "}
          <a href="mailto:usamajutt99877@gmail.com" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
            usamajutt99877@gmail.com
          </a>
          . For the fastest response, please use the form below and select the topic that best matches your message.
        </P>
      </Section>

      <Section title="Send us a message">
        <div className="card mt-4 p-6 dark:border-night-700 dark:bg-night-900">
          <ContactForm />
        </div>
      </Section>
    </PageShell>
  );
}
