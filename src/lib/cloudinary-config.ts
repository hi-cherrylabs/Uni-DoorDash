import { CATEGORIES } from "@/data/catalog";

// Cloud name and API key are NOT secrets — Cloudinary's own docs treat them
// as public identifiers, the same way Firebase's web apiKey is public. Only
// the API secret is sensitive, and it never appears in this file or any
// other client-bundled file — see src/server/cloudinary-upload.ts, which
// reads it exclusively from process.env on the server.
export const CLOUDINARY_CLOUD_NAME = "f31lrtiv";
export const CLOUDINARY_API_KEY = "982871317289965";

/**
 * Maps a product category to a Cloudinary folder name. Shared by the client
 * (for display only) and the server (for enforcement) so the two never
 * drift apart. Anything that isn't a known category collapses to "Misc"
 * rather than letting arbitrary input shape a folder path.
 */
export function categoryToFolder(category: string): string {
  const match = CATEGORIES.find(
    (c) => c.toLowerCase() === category.toLowerCase(),
  );
  const safe = (match ?? "Misc")
    .replace(/[^a-zA-Z0-9 _-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `products/${safe || "Misc"}`;
}
