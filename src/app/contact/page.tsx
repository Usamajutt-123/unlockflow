"use client";
import PageShell from "@/components/PageShell";
import { Section, P, Cards } from "@/components/InfoContent";
import { useState } from "react";

function ContactForm() {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div>
        <label className="label">Name</label>
        <input className="field" placeholder="Your name" required />
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" className="field" placeholder="you@example.com" required />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Message</label>
        <textarea className="field min-h-[120px]" placeholder="How can we help?" required />
      </div>
      <div className="sm:col-span-2">
        <button className="btn-primary w-full">
          {sent ? (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Message Sent!
            </>
          ) : (
            "Send Message"
          )}
        </button>
      </div>
    </form>
  );
}

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
