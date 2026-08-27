import { usePushNotifications } from "@/hooks/use-push-notifications";

/** Renders nothing — exists purely to run usePushNotifications() once, app-wide. */
export function PushNotificationsBridge() {
  usePushNotifications();
  return null;
}
