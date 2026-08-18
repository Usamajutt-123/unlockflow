import PageShell from "@/components/PageShell";
import { Section, P, List, Cards } from "@/components/InfoContent";

export default function AdvancedOptionsPage() {
  return (
    <PageShell
      badge="Product · Advanced Options"
      title="Advanced Options"
      subtitle="All the power you need to craft a unique, premium unlock page — fully optional and easy to use."
    >
      <Section title="Customize every detail">
        <P>
          Beyond the basics, UNLOCKFLOW gives you fine-grained control over how your unlock page looks and behaves.
          Every option below is optional — set only what you need.
        </P>
      </Section>

      <Cards
        items={[
          { title: "Page Title", desc: "Set a headline for your unlock page instead of the default." },
          { title: "Description", desc: "Add a short message to explain what visitors must do." },
          { title: "Banner Image", desc: "Upload a banner to make your page stand out." },
          { title: "Icon Image", desc: "Show a custom icon next to your title." },
          { title: "Password", desc: "Protect your link so the reward opens only with a password." },
          { title: "Expiry Date", desc: "Make your link automatically expire on a set date." },
          { title: "Custom Slug", desc: "Choose a clean, memorable short URL like /unlock/your-name." },
        ]}
      />

      <Section title="Example: a premium setup">
        <List
          items={[
            "Set a custom title and description.",
            "Upload your brand banner and icon.",
            "Protect with a password for VIP rewards.",
            "Add an expiry date for limited-time offers.",
            "Use a custom slug so the link looks professional.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
