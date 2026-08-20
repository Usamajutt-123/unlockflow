import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Section, P, List } from "@/components/InfoContent";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Everything you need to know to get the most out of UNLOCKFLOW — getting started, adding tasks, destination links, advanced options, and troubleshooting.",
  openGraph: {
    title: "UNLOCKFLOW Documentation",
    description:
      "A practical guide to creating unlock links with UNLOCKFLOW — tasks, passwords, expiry dates, custom slugs, QR codes, and troubleshooting.",
  },
};

export default function DocsPage() {
  return (
    <PageShell
      badge="Resources · Documentation"
      title="Documentation"
      subtitle="Everything you need to know to get the most out of UNLOCKFLOW."
    >
      <Section title="Getting Started">
        <P>
          UNLOCKFLOW lets you turn a simple link into an engaging unlock experience. You create an unlock link, choose
          the tasks visitors must complete, add your destination reward, and share the link anywhere. Visitors complete
          the tasks to unlock the reward — no account required for them.
        </P>
        <List
          items={[
            "Go to the Link Generator.",
            "Select the tasks you want visitors to complete.",
            "Add your destination (reward) link.",
            "Optionally open Advanced Options to customize.",
            "Click Generate Link — then copy your link or save the QR code.",
          ]}
        />
      </Section>

      <Section title="Link Generator">
        <P>
          The Link Generator is where you build unlock links. It walks you through adding tasks, setting your
          destination link, and customizing your unlock page before generating a ready-to-share link and QR code.
        </P>
      </Section>

      <Section title="Adding Tasks">
        <P>
          Tasks are the actions visitors complete to unlock your reward, such as subscribing to a channel, following an
          account, joining a group, or visiting a link. Click a task in the library, paste the relevant link, and press
          Enter to add it to your link.
        </P>
      </Section>

      <Section title="Multiple Tasks">
        <P>
          You can add many tasks to a single unlock link. Each task opens its own input, and visitors must complete all
          of them to unlock the reward.
        </P>
      </Section>

      <Section title="Custom Tasks">
        <P>
          With "Add Custom Link" you can create a task with a name and link of your choosing. The name you set is what
          visitors see, so you can define any action that makes sense for your audience.
        </P>
      </Section>

      <Section title="Destination Links">
        <P>
          The destination link is the reward visitors receive after completing all tasks. It can be any valid web URL.
          UNLOCKFLOW does not control the content of third-party destination websites.
        </P>
      </Section>

      <Section title="Advanced Options">
        <P>
          Advanced Options let you personalize your unlock page and link. Available settings include a page title and
          description, an icon image, an unlock-page theme, a video thumbnail, a password, an expiry date, and a custom
          slug.
        </P>
      </Section>

      <Section title="Password Protection">
        <P>
          Set a password in Advanced Options to gate your reward. After completing all tasks, visitors must enter the
          password before the destination link opens. This is useful for exclusive or VIP rewards.
        </P>
      </Section>

      <Section title="Expiry Dates">
        <P>
          Set an expiry date in Advanced Options to limit how long a link stays active. After the date passes, the link
          shows an "expired" message instead of accepting visitors.
        </P>
      </Section>

      <Section title="Custom Slugs">
        <P>
          A custom slug is the readable part of your unlock link's URL. In Advanced Options you can set your own slug,
          such as <span className="font-semibold text-brand-600 dark:text-brand-400">/unlock/my-offer</span>, instead
          of using a randomly generated one.
        </P>
      </Section>

      <Section title="QR Codes">
        <P>
          Every generated link includes a QR code. You can download it and share it anywhere — when scanned, it opens
          your unlock link so visitors can complete the tasks.
        </P>
      </Section>

      <Section title="Unlock Pages">
        <P>
          The unlock page is what visitors see. It lists the tasks to complete, shows progress, and reveals the reward
          once all tasks are done. Visitors don't need an account, and their progress is remembered in their browser.
        </P>
      </Section>

      <Section title="Troubleshooting">
        <List
          items={[
            "Link shows \"not found\": the link may not exist or may not be published yet.",
            "Link shows \"expired\": the creator set an expiry date that has passed.",
            "Link shows \"unavailable\": the creator turned the link off.",
            "A task won't mark as complete: finish the action in the tab that opens, return to the page, and tap the task again if needed.",
            "Reward won't open: make sure every task is completed and, if a password is set, that you enter the correct one.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
