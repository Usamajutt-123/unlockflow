import type { Ad, AdSlot } from "./types";

// ===========================================================================
// ADSTERRA — BANNER ADS on the unlock page
//
// Banner-type ads only. No popunder, social bar, in-page push, interstitial,
// or auto-popup is added here.
//
// Format used: Adsterra "Banner" — the `atOptions` + `invoke.js` iframe snippet
// served from www.highperformanceformat.com. Each banner needs its OWN key:
// do NOT paste the same key into two placements (Adsterra serves one ad per
// key, and each unit also writes a shared `atOptions` config).
//
// Sizes (the unlock page is a single narrow column, max ~900px, and it caps
// every ad at max-width:100% + clips overflow, so ads shrink to fit on
// tablet/mobile with no horizontal scrolling):
//
//   Placement #1  middle of task list   -> 300×250 (Medium Rectangle)  ✓ added
//   Placement #2  above unlock button   -> 728×90  (Leaderboard)       ✓ added
//   Placement #3  center of FAQ         -> 468×60  (Full Banner)         ✓ added
//   Placement #4  bottom of page        -> 320×50  (Mobile Banner)     ✓ added
// ===========================================================================

// --- Real Adsterra banner keys (provided) ----------------------------------
const KEY_TASK_CENTER = "386fa497e940ef148757dcf426ec9c77"; // #1 · 300×250
const KEY_ABOVE_UNLOCK = "d64b7028d4cb67d9cada0f086c3c4150"; // #2 · 728×90
const KEY_FAQ = "f4a5e121e0ae2bfa12811b5c812a1daa"; // #3 · 468×60
const KEY_BOTTOM = "50289496f06badb8b7fb0fd39de37e84"; // #4 · 320×50

// Builds the exact Adsterra banner snippet for a given key + size.
function adsterraBannerScript(key: string, width: number, height: number): string {
  return `<script>
  atOptions = {
    'key' : '${key}',
    'format' : 'iframe',
    'height' : ${height},
    'width' : ${width},
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/${key}/invoke.js"></script>`;
}

function adsterraBannerAd(slot: AdSlot, key: string, width: number, height: number): Ad {
  return {
    slot,
    title: "Sponsored",
    image_url: "",
    link_url: "",
    type: "script",
    script: adsterraBannerScript(key, width, height),
    active: true,
  };
}

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
  // Placement #1 — banner in the middle of the task list (300×250).
  task_center: [adsterraBannerAd("task_center", KEY_TASK_CENTER, 300, 250)],
  // Placement #2 — banner directly above the Unlock Reward button (728×90).
  task: [adsterraBannerAd("task", KEY_ABOVE_UNLOCK, 728, 90)],
  above_unlock: [],
  // Placement #3 — banner in the center of the FAQ (468×60).
  faq: [adsterraBannerAd("faq", KEY_FAQ, 468, 60)],
  // Placement #4 — banner at the bottom of the page (320×50).
  social: [adsterraBannerAd("social", KEY_BOTTOM, 320, 50)],
};
