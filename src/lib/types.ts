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
