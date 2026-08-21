export interface Task {
  id?: string;
  link_id?: string;
  task_type: string;      // e.g. "youtube", "instagram", "custom"
  label: string;          // e.g. "Subscribe"
  task_url: string;       // redirect URL
  position: number;
  icon?: string;          // brand key
}

export interface UnlockLink {
  id?: string;
  slug: string;
  title: string;
  description: string;
  destination_url: string;
  banner_url: string;
  icon_url: string;
  video_url?: string;
  has_password: boolean;
  password_hash?: string | null;
  expiry_date?: string | null;
  theme?: string;
  active: boolean;
  views?: number;
  clicks?: number;
  completions?: number;
  created_at?: string;
  tasks?: Task[];
}

export interface TaskOption {
  id: string;
  label: string;       // e.g. "Subscribe"
  brand: string;       // brand key for icon
  brandColor: string;
  placeholder: string; // placeholder for the task URL input
}

export interface GeneratedResult {
  slug: string;
  fullUrl: string;
  destination_url: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  type: "post" | "guide";
  category: string;
  excerpt: string;
  content: string;
  cover_image: string;
  gallery: string[];
  video_url: string;
  seo_title: string;
  seo_description: string;
  author: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const POST_TYPES = ["post", "guide"] as const;
export const POST_CATEGORIES = [
  "General",
  "YouTube",
  "Instagram",
  "Growth",
  "Guides",
  "Tools",
  "Marketing",
  "Announcements",
] as const;

export type AdSlot =
  | "banner"        // Native / In-Page Push below header (kept)
  | "task"          // Banner above the unlock button (slot reused)
  | "task_center"   // Banner — middle of the task list
  | "above_unlock"  // Popup ad on the Unlock Reward button
  | "faq"           // Banner — center of the FAQ
  | "social";       // Banner — bottom of the page (slot reused)
/** All six slots already exist in the ads table (migrations 0007/0008), so
 *  no new migration is needed. The old "task" and "social" placements are
 *  simply reused as banner placements. */
export const AD_SLOTS: AdSlot[] = [
  "banner",
  "above_unlock",
  "task_center",
  "task",
  "faq",
  "social",
];
export const AD_SLOT_LABELS: Record<AdSlot, string> = {
  banner: "Native / In-Page Push (below header)",
  task: "Banner (above unlock button)",
  task_center: "Banner (middle of task list)",
  above_unlock: "Popup ad (on Unlock Reward)",
  faq: "Banner (center of FAQ)",
  social: "Banner (bottom of page)",
};
export const AD_SLOT_HINTS: Partial<Record<AdSlot, string>> = {
  banner: "Paste a Monetag or Adsterra Native / In-Page Push code. It shows below the header.",
  above_unlock: "Popup ad that appears when the visitor taps the Unlock Reward button.",
  task_center: "Banner shown in the middle of the task list. For links with more than 5 tasks, a second banner from this slot appears lower in the list — create two ads in this slot to show different banners.",
  task: "Banner shown right above the Unlock Reward button.",
  faq: "Banner shown in the center of the FAQ section.",
  social: "Banner shown at the bottom of the unlock page, before the footer.",
};

export type AdType = "image" | "script";

export interface Ad {
  id?: string;
  slot: AdSlot;
  title: string;
  image_url: string;
  link_url: string;
  type: AdType;        // "image" = banner image ad, "script" = Adsterra/Monetag script
  script: string;      // raw HTML/JS ad code (used when type === "script")
  active: boolean;
  created_at?: string;
}
