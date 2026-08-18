import PageShell from "@/components/PageShell";
import { Section, P, List, Cards } from "@/components/InfoContent";

export default function QrCodesPage() {
  return (
    <PageShell
      badge="Product · QR Codes"
      title="QR Codes"
      subtitle="Every unlock link comes with a beautiful, scannable QR code — shareable anywhere, online or offline."
    >
      <Section title="Instant QR for every link">
        <P>
          When you generate an unlock link, UNLOCKFLOW automatically creates a QR code for it. No extra steps, no
          extra tools — it's ready the moment your link is created.
        </P>
      </Section>

      <Section title="Where to use QR codes">
        <List
          items={[
            "Print on posters, flyers, and business cards.",
            "Add to your YouTube video descriptions or thumbnails.",
            "Share in WhatsApp groups and Telegram channels.",
            "Display on live streams and event screens.",
            "Embed in your website or email signatures.",
          ]}
        />
      </Section>

      <Section title="Scan & unlock">
        <P>
          A visitor scans the code with any phone camera, opens the unlock page, completes your tasks, and unlocks the
          reward. It's the easiest way to bridge offline and online audiences.
        </P>
      </Section>
    </PageShell>
  );
}
