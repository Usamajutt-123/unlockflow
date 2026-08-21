import type { Ad, AdSlot } from "./types";

// Built-in fallback ad (Adsterra Native Banner).
// Shows on every unlock page in the "banner" slot (below the header).
// Ads saved in the Ads Manager (admin panel) for a slot always take
// priority — this fallback only fills slots that have no active ad.
export const DEFAULT_AD_SCRIPT = `<script async="async" data-cfasync="false" src="https://pl30943028.effectivecpmnetwork.com/c3d4d44c4169728aba62c4a0b24127f5/invoke.js"></script>
<div id="container-c3d4d44c4169728aba62c4a0b24127f5"></div>`;

export const DEFAULT_ADS: Record<AdSlot, Ad[]> = {
  banner: [
    {
      slot: "banner",
      title: "Sponsored",
      image_url: "",
      link_url: "",
      type: "script",
      script: DEFAULT_AD_SCRIPT,
      active: true,
    },
  ],
  task: [],
  task_center: [],
  above_unlock: [],
  faq: [],
  social: [],
};
