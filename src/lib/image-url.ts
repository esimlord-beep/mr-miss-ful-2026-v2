/**
 * Builds an optimized image URL using Supabase Storage's built-in (free)
 * image transformation API, instead of Vercel's next/image optimizer.
 *
 * Why: next/image's optimizer counts every generated size as a
 * "transformation" against Vercel's free-tier quota (5,000/month), which we
 * hit almost immediately. Supabase's own transform endpoint is included free
 * and gives us resizing + caching without that limit. Combined with the
 * long-lived cacheControl set at upload time (see admin/actions.ts), this
 * also keeps Supabase egress down, since resized images are much smaller
 * than the originals and get cached by the browser/CDN.
 *
 * Supabase transform docs: append /render/image/ in place of /object/ on the
 * public storage URL, plus width/height/quality query params.
 */
export function optimizedImageUrl(
  url: string | null | undefined,
  { width, quality = 75 }: { width: number; quality?: number }
): string {
  if (!url) return "/placeholder-avatar.png";

  // Only rewrite Supabase Storage public URLs; leave anything else untouched
  // (e.g. local /placeholder-avatar.png fallback).
  const marker = "/storage/v1/object/public/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const base = url.slice(0, idx);
  const path = url.slice(idx + marker.length);

  return `${base}/storage/v1/render/image/public/${path}?width=${width}&quality=${quality}`;
}
