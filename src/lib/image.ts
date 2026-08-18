// Compress an image file client-side to keep storage minimal.
// Returns a small WebP/JPEG blob (target ~64KB) + data URL fallback.

const MAX_DIM = 256; // icons are small
const TARGET_KB = 64;

export async function compressIcon(file: File): Promise<{ blob: Blob; dataUrl: string }> {
  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);

  // Try WebP first, fall back to JPEG
  let blob = await canvasToBlob(canvas, "image/webp", 0.8);
  if (!blob || blob.size > TARGET_KB * 1024) {
    blob = await canvasToBlob(canvas, "image/jpeg", 0.8);
  }
  // last resort: lower quality
  if (!blob || blob.size > TARGET_KB * 1024) {
    blob = await canvasToBlob(canvas, "image/jpeg", 0.55);
  }
  if (!blob) throw new Error("Could not compress image");

  const outDataUrl = await blobToDataUrl(blob);
  return { blob, dataUrl: outDataUrl };
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((res) => canvas.toBlob(res, type, quality));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}
