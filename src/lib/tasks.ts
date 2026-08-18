import { TaskOption } from "./types";

export const TASK_OPTIONS: TaskOption[] = [
  { id: "subscribe", label: "Subscribe", brand: "youtube", brandColor: "#FF0000", placeholder: "https://youtube.com/@yourchannel" },
  { id: "add_2nd_channel", label: "Add 2nd Channel", brand: "youtube", brandColor: "#FF0000", placeholder: "https://youtube.com/@your2ndchannel" },
  { id: "sub_like_video", label: "Subscribe & Like Video", brand: "youtube", brandColor: "#FF0000", placeholder: "https://youtube.com/watch?v=VIDEO_ID" },
  { id: "sub_bell", label: "Subscribe & Turn on Bell", brand: "youtube", brandColor: "#FF0000", placeholder: "https://youtube.com/@yourchannel" },
  { id: "add_youtube_channel", label: "Add YouTube Channel", brand: "youtube", brandColor: "#FF0000", placeholder: "https://youtube.com/@yourchannel" },
  { id: "youtube_like", label: "YouTube Like", brand: "youtube", brandColor: "#FF0000", placeholder: "https://youtube.com/watch?v=VIDEO_ID" },
  { id: "youtube_comment", label: "YouTube Comment", brand: "youtube", brandColor: "#FF0000", placeholder: "https://youtube.com/watch?v=VIDEO_ID" },
  { id: "yt_like_comment", label: "YouTube Like & Comment", brand: "youtube", brandColor: "#FF0000", placeholder: "https://youtube.com/watch?v=VIDEO_ID" },
  { id: "instagram_followers", label: "Instagram Followers", brand: "instagram", brandColor: "#E4405F", placeholder: "https://instagram.com/yourusername" },
  { id: "instagram_post_like", label: "Instagram Post Like", brand: "instagram", brandColor: "#E4405F", placeholder: "https://instagram.com/p/POST_ID" },
  { id: "instagram_story", label: "Instagram Story View", brand: "instagram", brandColor: "#E4405F", placeholder: "https://instagram.com/stories/yourusername" },
  { id: "facebook_followers", label: "Facebook Followers", brand: "facebook", brandColor: "#1877F2", placeholder: "https://facebook.com/yourpage" },
  { id: "like_fb_post", label: "Like Facebook Post", brand: "facebook", brandColor: "#1877F2", placeholder: "https://facebook.com/yourpage/posts" },
  { id: "facebook_group", label: "Facebook Group Join", brand: "facebook", brandColor: "#1877F2", placeholder: "https://facebook.com/groups/yourgroup" },
  { id: "telegram_member", label: "Telegram Member", brand: "telegram", brandColor: "#26A5E4", placeholder: "https://t.me/yourchannel" },
  { id: "whatsapp_channel", label: "WhatsApp Channel Join", brand: "whatsapp", brandColor: "#25D366", placeholder: "https://whatsapp.com/channel/CHANNEL_ID" },
  { id: "tiktok_follow", label: "TikTok Follow", brand: "tiktok", brandColor: "#0f0f0f", placeholder: "https://tiktok.com/@yourusername" },
  { id: "tiktok_like", label: "TikTok Like Video", brand: "tiktok", brandColor: "#0f0f0f", placeholder: "https://tiktok.com/@yourusername/video/ID" },
  { id: "join_discord", label: "Join Discord", brand: "discord", brandColor: "#5865F2", placeholder: "https://discord.gg/yourinvite" },
  { id: "follow_twitter", label: "Follow on Twitter", brand: "twitter", brandColor: "#0f1419", placeholder: "https://twitter.com/yourusername" },
  { id: "custom", label: "Add Custom Link", brand: "custom", brandColor: "#3370ff", placeholder: "https://yourlink.com" },
];

export function getTaskOption(id: string): TaskOption | undefined {
  return TASK_OPTIONS.find((t) => t.id === id);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

// Generate a short, URL-safe random slug
export function randomSlug(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function hashPassword(pw: string): Promise<string> {
  const data = new TextEncoder().encode("unlockflow::" + pw);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  const candidate = await hashPassword(pw);
  return candidate === hash;
}
