import { createServerFn } from "@tanstack/react-start";
import { createHash } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { ADMIN_EMAIL } from "@/lib/firebase";
import { categoryToFolder } from "@/lib/cloudinary-config";

// Firebase ID tokens are RS256-signed JWTs. Verifying them here means
// checking the signature against Google's own public keys — not just
// trusting whatever claims the client hands us — so this is equivalent in
// strength to using the Firebase Admin SDK, without needing a second
// service-account secret.
const FIREBASE_PROJECT_ID = "uni-doordash";
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

async function verifyAdmin(idToken: string): Promise<void> {
  let email: string | undefined;
  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    email = typeof payload['email'] === "string" ? payload['email'] : undefined;
  } catch {
    throw new Error("Not authenticated.");
  }

  if (!email || email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Only the admin account can upload product images.");
  }
}

function signParams(params: Record<string, string | number>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(toSign + apiSecret).digest("hex");
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

    const apiSecret = process.env['CLOUDINARY_API_SECRET'];
    if (!apiSecret) {
      throw new Error("Image upload isn't configured on the server yet (missing CLOUDINARY_API_SECRET).");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = categoryToFolder(data.category);
    const signature = signParams({ folder, timestamp }, apiSecret);

    return { timestamp, folder, signature };
  });
