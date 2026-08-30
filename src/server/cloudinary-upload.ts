import { createServerFn } from "@tanstack/react-start";
import { createHash } from "node:crypto";

import { categoryToFolder } from "@/lib/cloudinary-config";
import { verifyAdmin } from "@/server/verify-auth";

function signParams(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");
}

/**
 * Called from the client right before an image upload. Verifies the caller
 * is the admin, then returns a short-lived signature scoped to one folder +
 * timestamp — the client uploads directly to Cloudinary with this, the
 * upload never passes through our own server.
 */
export const getCloudinaryUploadSignature = createServerFn({ method: "POST" })
  .validator((data: { idToken: string; category: string }) => data)
  .handler(async ({ data }) => {
    await verifyAdmin(data.idToken);

    const apiSecret = process.env["CLOUDINARY_API_SECRET"];
    if (!apiSecret) {
      throw new Error(
        "Image upload isn't configured on the server yet (missing CLOUDINARY_API_SECRET).",
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = categoryToFolder(data.category);
    const signature = signParams({ folder, timestamp }, apiSecret);

    return { timestamp, folder, signature };
  });
