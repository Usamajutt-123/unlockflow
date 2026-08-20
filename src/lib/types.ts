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
  | "banner"
  | "task"
  | "task_center"
  | "above_unlock"
  | "faq"
  | "social";
/** Slots shown in admin — values stay on the existing ads table (no new migration). */
export const AD_SLOTS: AdSlot[] = [
  "banner",
  "task",
  "above_unlock",
  "social",
];
export const AD_SLOT_LABELS: Record<AdSlot, string> = {
  banner: "Native / In-Page Push (below header)",
  task: "Native (inside task list)",
  task_center: "Task center (legacy)",
  above_unlock: "Interstitial (on Unlock Reward)",
  faq: "FAQ (legacy)",
  social: "Sticky bar (fixed bottom)",
};
export const AD_SLOT_HINTS: Partial<Record<AdSlot, string>> = {
  banner: "Paste a Monetag or Adsterra Native / In-Page Push code. It shows below the header.",
  task: "Paste a Native unit. It shows once inside the task list.",
  above_unlock: "Paste an Interstitial code. It only fires when the visitor taps Unlock Reward.",
  social: "Paste In-Page Push or a sticky/social-bar code. Fixed at the bottom, with a close button.",
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
