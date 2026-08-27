import { getToken, onMessage } from "firebase/messaging";
import { useEffect } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { FCM_VAPID_KEY } from "@/lib/fcm-config";
import { getMessagingClient } from "@/lib/firebase";
import { savePushToken } from "@/lib/firestore-data";

/**
 * Runs once per sign-in: requests Notification permission, registers this
 * device's push token, and shows a toast for any message that arrives while
 * the tab is focused (background messages are handled by the service worker
 * — see public/firebase-messaging-sw.js). Fails silently and never disrupts
 * the rest of the app — push is a nice-to-have, not core functionality, and
 * plenty of legitimate situations (no VAPID key configured yet, unsupported
 * browser, permission denied) mean it just won't be available.
 */
export function usePushNotifications() {
  const { user } = useAuth();
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    if (!FCM_VAPID_KEY) return; // not configured yet — see lib/fcm-config.ts

    let unsubscribeForeground: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const messaging = await getMessagingClient();
        if (!messaging || cancelled) return;

        const permission = await Notification.requestPermission();
        if (permission !== "granted" || cancelled) return;

        const token = await getToken(messaging, { vapidKey: FCM_VAPID_KEY });
        if (!token || cancelled) return;

        await savePushToken(uid, token, user?.email ?? null);

        unsubscribeForeground = onMessage(messaging, (payload) => {
          const title = payload.notification?.title ?? "Uni Door Dash";
          const body = payload.notification?.body;
          toast(title, body ? { description: body } : undefined);
        });
      } catch (error) {
        console.warn("Push notification setup skipped:", error);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribeForeground?.();
    };
  }, [uid, user?.email]);
}
