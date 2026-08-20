import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Section, P, List } from "@/components/InfoContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the UNLOCKFLOW Privacy Policy to understand what information is collected, how it is used, and the choices you have.",
  openGraph: {
    title: "Privacy Policy | UNLOCKFLOW",
    description:
      "UNLOCKFLOW's Privacy Policy — what we collect, how we use information, browser storage, and your choices.",
  },
};

export default function PrivacyPage() {
  return (
    <PageShell
      badge="Company · Privacy"
      title="Privacy Policy"
      subtitle="How UNLOCKFLOW handles information and the choices you have."
    >
      <Section title="Introduction">
        <P>
          This Privacy Policy describes how UNLOCKFLOW ("we", "us", or "our") handles information when you use our
          platform, including when you create unlock links as a creator and when you visit an unlock page as a visitor.
          By using UNLOCKFLOW, you agree to the practices described in this policy.
        </P>
      </Section>

      <Section title="Information We Collect">
        <P>
          UNLOCKFLOW is designed to collect only the information needed to provide and improve the service. This
          includes:
        </P>
        <List
          items={[
            "Creator-submitted link configuration, such as titles, descriptions, destination URLs, task URLs and names, custom slugs, icon images, optional passwords and expiry dates, and related settings.",
            "Usage statistics about unlock links, such as the number of views, clicks, and completions, used to power the analytics features on unlock pages and the creator dashboard.",
            "Browser storage placed on your device to remember preferences and completion state (described below).",
          ]}
        />
        <P>
          We do not require visitors to create a public account to use an unlock page. Visitors can complete tasks and
          access rewards without registering or providing personal details.
        </P>
      </Section>

      <Section title="Information We Do Not Require">
        <P>
          Using an unlock page does not require you to provide a name, email address, or phone number, and we do not ask
          visitors for such information. We also do not intentionally collect precise location data, device
          fingerprints, or similar personal identifiers as part of the core service.
        </P>
      </Section>

      <Section title="How We Use Information">
        <P>
          We use the information described above to operate, maintain, and improve the platform. Specifically, we use
          it to:
        </P>
        <List
          items={[
            "Power unlock links, task flows, and destination links created by creators.",
            "Provide analytics such as views, clicks, and completions.",
            "Maintain functionality, security, and performance of the service.",
            "Provide support and communicate about the service when relevant.",
          ]}
        />
      </Section>

      <Section title="Browser Storage">
        <P>
          We use browser localStorage to improve your experience. In particular, UNLOCKFLOW stores your theme preference
          (light or dark) so the site loads with your chosen theme. On unlock pages, we also store which tasks you have
          completed, so your progress is preserved if you reload the page. This storage stays on your device and can be
          cleared at any time through your browser settings.
        </P>
      </Section>

      <Section title="Cookies and Similar Technologies">
        <P>
          UNLOCKFLOW may use cookies or similar technologies where necessary for functionality, security, analytics, or
          third-party services. We do not rely on these technologies to collect personal information beyond what is
          described in this policy.
        </P>
      </Section>

      <Section title="Third-Party Services">
        <P>
          UNLOCKFLOW may use third-party infrastructure and service providers for hosting, database, storage, analytics,
          security, and advertising. For example, the platform relies on a hosted database and storage backend to save
          and retrieve unlock links, tasks, and related data. These providers may process information only as needed to
          provide their services to us and in accordance with their own policies.
        </P>
      </Section>

      <Section title="Creator-Submitted Content">
        <P>
          Creators are responsible for the URLs, task links, images, text, and other content they submit. This includes
          destination URLs, task URLs, custom task names, titles, descriptions, custom slugs, icon images, and any
          optional password or expiry configuration. Creators should only submit content they are authorized to use and
          share.
        </P>
      </Section>

      <Section title="Data Retention">
        <P>
          We retain the information needed to operate the service for as long as it remains useful, including while a
          creator keeps a link active. Aggregated analytics are kept in a form that supports the analytics features.
          Creators who wish to remove a link and its associated data can do so through the available management
          controls, and visitors can clear browser storage at any time.
        </P>
      </Section>

      <Section title="Data Security">
        <P>
          We take reasonable measures to protect the information we process from unauthorized access, alteration, or
          loss, including the use of secure connections and access controls where appropriate. No method of transmission
          or storage is completely secure, so we cannot guarantee absolute security.
        </P>
      </Section>

      <Section title="Your Choices">
        <P>
          You can clear browser storage to remove theme preferences and task-completion state at any time. Creators can
          update or remove the links and content they have submitted through the available management tools. If you have
          questions about your data, you can contact us through the Contact page.
        </P>
      </Section>

      <Section title="Children's Privacy">
        <P>
          UNLOCKFLOW is not directed to children, and we do not knowingly collect personal information from children
          under the age of 13. If you believe a child has provided us with personal information, please contact us so we
          can take appropriate action.
        </P>
      </Section>

      <Section title="Changes to This Policy">
        <P>
          We may update this Privacy Policy from time to time. When we make material changes, we will update the
          "Last updated" date at the top of this page. Continued use of the service after changes take effect means you
          accept the updated policy.
        </P>
      </Section>

      <Section title="Contact">
        <P>
          If you have any questions about this Privacy Policy or how your information is handled, please reach out to us
          through the <a href="/contact" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Contact page</a>.
        </P>
      </Section>
    </PageShell>
  );
}
