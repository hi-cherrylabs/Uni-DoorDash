import { createServerFn } from "@tanstack/react-start";
import {
  cert,
  getApps as getAdminApps,
  initializeApp as initializeAdminApp,
} from "firebase-admin/app";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

import { ADMIN_EMAIL } from "@/lib/firebase";
import { verifyAdmin, verifyIdToken } from "@/server/verify-auth";

// Actually SENDING a push (as opposed to just verifying who's asking) needs
// a Firebase service account — a real secret, separate from the web
// apiKey. Generate one at:
//   Firebase Console → Project Settings → Service accounts →
//   "Generate new private key" → this downloads a JSON file.
// Set its full contents (as a single-line JSON string) as the
// FIREBASE_SERVICE_ACCOUNT_JSON environment variable — same rule as
// CLOUDINARY_API_SECRET: no VITE_ prefix, server-only, never commit it.
function getAdminApp() {
  const existing = getAdminApps();
  if (existing.length > 0) return existing[0]!;

  const raw = process.env["FIREBASE_SERVICE_ACCOUNT_JSON"];
  if (!raw) {
    throw new Error(
      "Push notifications aren't configured on the server yet (missing FIREBASE_SERVICE_ACCOUNT_JSON).",
    );
  }
  const serviceAccount = JSON.parse(raw) as Parameters<typeof cert>[0];
  return initializeAdminApp({ credential: cert(serviceAccount) });
}

async function sendToTokens(
  tokens: string[],
  title: string,
  body: string,
): Promise<void> {
  const unique = [...new Set(tokens)].filter(Boolean);
  if (unique.length === 0) return;
  // sendEachForMulticast reports per-token success/failure rather than
  // failing the whole batch if one token is stale — appropriate here since
  // tokens naturally go stale when someone signs out or clears data.
  await getMessaging(getAdminApp()).sendEachForMulticast({
    tokens: unique,
    notification: { title, body },
  });
}

/** Admin only — broadcasts to every registered device. Called after a new product is posted. */
export const notifyNewProduct = createServerFn({ method: "POST" })
  .validator((data: { idToken: string; productName: string }) => data)
  .handler(async ({ data }) => {
    await verifyAdmin(data.idToken);
    const db = getAdminFirestore(getAdminApp());
    const snapshot = await db.collection("pushTokens").get();
    const tokens = snapshot.docs.map((d) => d.data()["token"] as string);
    await sendToTokens(
      tokens,
      "New on Uni Door Dash",
      `${data.productName} just went live.`,
    );
  });

/** Admin only — targets one buyer's device(s). Called when their order is confirmed/delivered. */
export const notifyBuyer = createServerFn({ method: "POST" })
  .validator(
    (data: {
      idToken: string;
      buyerUid: string;
      title: string;
      body: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await verifyAdmin(data.idToken);
    const db = getAdminFirestore(getAdminApp());
    const tokenDoc = await db.collection("pushTokens").doc(data.buyerUid).get();
    const token = tokenDoc.data()?.["token"] as string | undefined;
    if (!token) return;
    await sendToTokens([token], data.title, data.body);
  });

/** Any signed-in buyer — notifies the admin's device(s). Called right after placing an order. */
export const notifyAdminNewOrder = createServerFn({ method: "POST" })
  .validator(
    (data: {
      idToken: string;
      productName: string;
      buyerName: string | null;
    }) => data,
  )
  .handler(async ({ data }) => {
    await verifyIdToken(data.idToken); // just needs to be a real signed-in user, not necessarily admin
    const db = getAdminFirestore(getAdminApp());
    const snapshot = await db
      .collection("pushTokens")
      .where("email", "==", ADMIN_EMAIL)
      .get();
    const tokens = snapshot.docs.map((d) => d.data()["token"] as string);
    await sendToTokens(
      tokens,
      "New order placed",
      `${data.buyerName ?? "Someone"} just ordered ${data.productName}.`,
    );
  });
