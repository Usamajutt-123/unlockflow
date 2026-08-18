// Extract a thumbnail from a video URL (YouTube / Vimeo) without storing any file.
// This keeps Supabase storage usage at ~zero: we just store the URL, and the
// thumbnail is loaded directly from the video host's CDN.

export interface VideoInfo {
  thumbnail: string;
  embed: string;
  provider: "youtube" | "vimeo" | "unknown";
}

export function parseVideoUrl(url: string): VideoInfo | null {
  const u = url.trim();
  if (!u) return null;

  // YouTube
  const ytId =
    u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{6,})/)?.[1] ||
    u.match(/(?:youtube\.com\/(?:embed|v|shorts)\/)([\w-]{6,})/)?.[1];
  if (ytId) {
    return {
      thumbnail: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
      embed: `https://www.youtube.com/embed/${ytId}`,
      provider: "youtube",
    };
  }

  // Vimeo
  const vimeo = u.match(/vimeo\.com\/(\d+)/)?.[1];
  if (vimeo) {
    return {
      thumbnail: `https://vumbnail.com/${vimeo}.jpg`,
      embed: `https://player.vimeo.com/video/${vimeo}`,
      provider: "vimeo",
    };
  }

  return null;
}
