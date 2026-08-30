// The VAPID key is public (it's sent to browsers so they can subscribe to
// push, the same way the Firebase web apiKey is public) — generated from:
//   Firebase Console → Project Settings → Cloud Messaging tab →
//   "Web configuration" section → "Web Push certificates".
// If this ever needs regenerating, requestPushPermission() in
// hooks/use-push-notifications.ts fails quietly (logged, not thrown) when
// it's empty or invalid — nothing else in the app breaks.
export const FCM_VAPID_KEY =
  "BDBjT83-bXKnZYAdCHMsz6q5YMURnfvReZCgs98Jrh7uQF0WIN1q0lnAgIh9EboIDrCBAIudjQDHK4EOUEYSS8g";
