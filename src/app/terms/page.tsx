import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Section, P, List } from "@/components/InfoContent";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms and conditions that apply to using UNLOCKFLOW, including acceptable use, creator responsibilities, and disclaimers.",
  openGraph: {
    title: "Terms of Service | UNLOCKFLOW",
    description:
      "Read the UNLOCKFLOW Terms of Service, covering acceptable use, creator responsibilities, destination links, and more.",
  },
};

export default function TermsPage() {
  return (
    <PageShell
      badge="Company · Terms"
      title="Terms of Service"
      subtitle="The terms and conditions that apply to using UNLOCKFLOW."
    >
      <Section title="1. Acceptance of Terms">
        <P>
          By accessing or using UNLOCKFLOW, you agree to be bound by these Terms of Service. Please read them carefully
          before creating unlock links or using the service. If you do not agree to these terms, you should not use
          UNLOCKFLOW.
        </P>
      </Section>

      <Section title="2. The UNLOCKFLOW Service">
        <P>
          UNLOCKFLOW is a link-unlocking platform that lets creators build unlock experiences. Creators select tasks,
          add a destination link, and share an unlock link. Visitors complete the selected tasks to unlock the
          destination. Administrative access to the UNLOCKFLOW management system is restricted to authorized
          administrators.
        </P>
      </Section>

      <Section title="3. Public Visitor Access">
        <P>
          Visitors can use UNLOCKFLOW unlock pages without creating a public account. Visitors agree to complete tasks
          in accordance with the instructions on each unlock page and to use the service lawfully.
        </P>
      </Section>

      <Section title="4. Creator Responsibilities">
        <P>
          Creators are responsible for the content they submit, including destination URLs, task URLs, custom task
          names, titles, descriptions, images, custom slugs, and any password or expiry configuration. Creators must
          ensure that:
        </P>
        <List
          items={[
            "Their content and destination links comply with applicable laws.",
            "They have the rights and permission to use the content they submit.",
            "Their unlock pages accurately represent what visitors will unlock.",
            "Any tasks they set are legitimate and not deceptive or misleading.",
          ]}
        />
      </Section>

      <Section title="5. Prohibited Uses">
        <P>You may not use UNLOCKFLOW to create or distribute content that involves:</P>
        <List
          items={[
            "Malware, viruses, or malicious code.",
            "Phishing, credential theft, or attempts to obtain unauthorized access.",
            "Fraud or scams.",
            "Illegal content or activity.",
            "Impersonation of individuals or organizations.",
            "Deceptive or misleading unlock pages.",
            "Spam or unsolicited bulk content.",
            "Copyright, trademark, or privacy violations.",
            "Abuse of the service or its security systems.",
            "Any other unlawful activity.",
          ]}
        />
        <P>We may investigate and take action against prohibited uses, including removal of content and suspension of access.</P>
      </Section>

      <Section title="6. Third-Party Platforms">
        <P>
          UNLOCKFLOW may be used with third-party platforms such as YouTube, Instagram, Facebook, Telegram, TikTok,
          Discord, and others. These platforms are operated by their respective owners. UNLOCKFLOW is not affiliated
          with, endorsed by, or sponsored by these platforms unless explicitly stated. Their use is subject to the terms
          and policies of those platforms.
        </P>
      </Section>

      <Section title="7. Destination Links">
        <P>
          UNLOCKFLOW does not control third-party destination websites. When a visitor unlocks a reward, they are
          directed to a website operated by the creator or a third party. UNLOCKFLOW is not responsible for the content,
          availability, accuracy, or practices of any destination website.
        </P>
      </Section>

      <Section title="8. Advertising and Third-Party Content">
        <P>
          Advertisements or third-party promotional content may appear on some pages. Such content is provided by
          third-party networks or partners and is subject to their own terms and policies. UNLOCKFLOW is not responsible
          for the content or accuracy of third-party advertising.
        </P>
      </Section>

      <Section title="9. Service Availability">
        <P>
          We aim to keep UNLOCKFLOW available and reliable, but we do not guarantee uninterrupted or error-free service.
          We may perform maintenance, updates, or changes that affect availability. Unlock links may also be unavailable
          if they expire, are turned off by their creator, or are removed for violating these terms.
        </P>
      </Section>

      <Section title="10. Suspension and Removal">
        <P>
          We may suspend access to or remove content that violates these terms, applicable law, or our policies, with or
          without notice. This includes links used for prohibited purposes as described above.
        </P>
      </Section>

      <Section title="11. Disclaimer">
        <P>
          UNLOCKFLOW is provided "as is" and "as available" without warranties of any kind, whether express or implied,
          to the maximum extent permitted by law. We do not warrant that the service will meet your requirements or be
          uninterrupted, secure, or error-free.
        </P>
      </Section>

      <Section title="12. Changes to Terms">
        <P>
          We may update these Terms of Service from time to time. We will update the "Last updated" date at the top of
          this page when changes are made. Continued use of the service after changes take effect means you accept the
          updated terms.
        </P>
      </Section>

      <Section title="13. Contact">
        <P>
          If you have any questions about these Terms of Service, please reach out to us through the{" "}
          <a href="/contact" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Contact page</a>.
        </P>
      </Section>
    </PageShell>
  );
}
