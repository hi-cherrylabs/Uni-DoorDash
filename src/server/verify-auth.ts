import { createRemoteJWKSet, jwtVerify } from "jose";

import { ADMIN_EMAIL } from "@/lib/firebase";

// Firebase ID tokens are RS256-signed JWTs. Verifying them here means
// checking the signature against Google's own public keys — not just
// trusting whatever claims the client hands us — so this is equivalent in
// strength to using the Firebase Admin SDK for auth checks, without needing
// a service-account secret just to verify who's calling.
const FIREBASE_PROJECT_ID = "uni-doordash";
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export type VerifiedCaller = { uid: string; email: string | undefined };

export async function verifyIdToken(idToken: string): Promise<VerifiedCaller> {
  let payload;
  try {
    ({ payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    }));
  } catch {
    throw new Error("Not authenticated.");
  }
  const uid = typeof payload.sub === "string" ? payload.sub : "";
  const email = typeof payload["email"] === "string" ? payload["email"] : undefined;
  if (!uid) throw new Error("Not authenticated.");
  return { uid, email };
}

export async function verifyAdmin(idToken: string): Promise<VerifiedCaller> {
  const caller = await verifyIdToken(idToken);
  if (!caller.email || caller.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Only the admin account can do this.");
  }
  return caller;
}
