import PageShell from "@/components/PageShell";
import { Section, P, List } from "@/components/InfoContent";

export default function TermsPage() {
  return (
    <PageShell
      badge="Company · Terms"
      title="Terms of Service"
      subtitle="The rules and conditions for using UNLOCKFLOW."
    >
      <Section title="Acceptance of terms">
        <P>
          By using UNLOCKFLOW, you agree to these terms. Please read them carefully before creating unlock links or
          using the service.
        </P>
      </Section>

      <Section title="Acceptable use">
        <List
          items={[
            "Use UNLOCKFLOW to create legitimate engagement and reward links.",
            "Ensure your destination links and tasks comply with applicable laws.",
            "Do not use the platform for spam, fraud, or misleading content.",
            "Respect the privacy and consent of your visitors.",
          ]}
        />
      </Section>

      <Section title="Your responsibility">
        <P>
          You are responsible for the content of your unlock links, including tasks, destination URLs, and any
          password-protected rewards. UNLOCKFLOW is provided "as is" without warranties.
        </P>
      </Section>

      <Section title="Changes">
        <P>
          We may update these terms from time to time. Continued use of the service after changes means you accept the
          updated terms.
        </P>
      </Section>
    </PageShell>
  );
}
