"use client";
import { useState } from "react";

export default function ContactForm() {
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
