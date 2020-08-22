import { Notifications, Notification } from "react-native-notifications";

export async function notify(title: string, body?: string): Promise<void> {
  const notification = new Notification({
    title,
    body,
  });

  Notifications.postLocalNotification(notification, Date.now());
}
