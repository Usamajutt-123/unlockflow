import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join us in building the future of creator engagement.",
};
import PageShell from "@/components/PageShell";
import { Section, P, Cards } from "@/components/InfoContent";

export default function CareersPage() {
  return (
    <PageShell
      badge="Company · Careers"
      title="Careers"
      subtitle="Join us in building the future of creator engagement."
    >
      <Section title="Why work with us">
        <P>
          We're a small, focused team obsessed with making great products for creators. If you love building fast,
          delightful tools, you'll fit right in.
        </P>
      </Section>

      <Cards
        items={[
          { title: "Product Engineer", desc: "Build the core platform — from the generator to the unlock flow. (Open)" },
          { title: "Product Designer", desc: "Craft premium, intuitive experiences across the product. (Open)" },
          { title: "Growth & Community", desc: "Help creators discover UNLOCKFLOW and grow together. (Open)" },
        ]}
      />

      <Section title="Open applications">
        <P>
          Don't see a perfect fit? Send us a note from the <a href="/contact" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Contact page</a> and tell us how you'd help.
        </P>
      </Section>
    </PageShell>
  );
}
