import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { Section, P, List, Cards } from "@/components/InfoContent";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Quick answers to the most common questions about UNLOCKFLOW — creating links, adding tasks, passwords, expiry dates, QR codes, and more.",
  openGraph: {
    title: "Help Center | UNLOCKFLOW",
    description:
      "Find quick answers to common questions about creating and using UNLOCKFLOW unlock links.",
  },
};

export default function HelpPage() {
  return (
    <PageShell
      badge="Resources · Help Center"
      title="Help Center"
      subtitle="Quick answers to the most common questions about UNLOCKFLOW."
    >
      <Section title="Getting Started">
        <P>Creating an unlock link takes only a few steps:</P>
        <List
          items={[
            "Open the Link Generator on the home page.",
            "Click tasks from the library, paste their links, and press Enter.",
            "Add your destination (reward) link.",
            "Optionally open Advanced Options to customize your link.",
            "Click Generate Link to create your unlock link and QR code.",
          ]}
        />
      </Section>

      <Section title="Frequently Asked Questions">
        <Cards
          items={[
            {
              title: "How do I create an unlock link?",
              desc: "Open the Link Generator on the home page, select the tasks you want, paste their links, add your destination reward link, and click Generate Link.",
            },
            {
              title: "Do visitors need an account?",
              desc: "No. Visitors can complete tasks and unlock rewards without creating an account or logging in.",
            },
            {
              title: "How do I add multiple tasks?",
              desc: "Click each task you want from the library. Each one opens its own input where you paste the link and press Enter.",
            },
            {
              title: "Can I select the same task more than once?",
              desc: "Yes. Clicking a task again opens another input for it, so you can require the same action multiple times with different links.",
            },
            {
              title: "What is a destination link?",
              desc: "The destination link is the reward URL visitors unlock after completing all tasks. It can be any valid web link.",
            },
            {
              title: "How do custom tasks work?",
              desc: "Choose \"Add Custom Link\", then enter a task name and the link you want visitors to visit. The name you set is what visitors see on the unlock page.",
            },
            {
              title: "Can I password-protect a link?",
              desc: "Yes. In Advanced Options, set a password. Visitors must enter it before the reward opens after completing all tasks.",
            },
            {
              title: "Can links expire?",
              desc: "Yes. In Advanced Options, set an expiry date. After that date passes, the link shows as expired.",
            },
            {
              title: "What is a custom slug?",
              desc: "The custom slug is the short, readable part of your unlock link's URL. In Advanced Options you can set one instead of using a random slug.",
            },
            {
              title: "How do QR codes work?",
              desc: "After generating a link, a QR code is shown automatically. You can download it and share it anywhere — scanning it opens your unlock link.",
            },
            {
              title: "What should I do if my link is not working?",
              desc: "Check that your destination and task links are valid, that you added at least one task, and that the link hasn't expired or been turned off. If it still fails, contact us through the Contact page.",
            },
            {
              title: "What if I completed the tasks but the link is still locked?",
              desc: "Make sure you completed every task on the page. If a password is set, you'll need to enter it. If the reward still won't open, contact us through the Contact page.",
            },
          ]}
        />
      </Section>

      <Section title="Still Need Help?">
        <P>
          Contact our support team from the{" "}
          <a href="/contact" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Contact page</a>{" "}
          — we're happy to help.
        </P>
      </Section>
    </PageShell>
  );
}
