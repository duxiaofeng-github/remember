import {globalStore} from "../../store";
import {navigate, Route} from "../route";

const errorPermissionDenied = new Error("Notification permission denied");

export async function notify(title: string, body?: string): Promise<void> {
  const notificationOptions = body ? {body} : undefined;
  let notification: Notification | undefined;

  if (Notification.permission === "granted") {
    notification = new Notification(title, notificationOptions);
  } else if (Notification.permission !== "denied") {
    notification = await new Promise((resolve, reject) => {
      Notification.requestPermission().then((permission: string) => {
        if (permission === "granted") {
          resolve(new Notification(title, notificationOptions));
        } else {
          reject(errorPermissionDenied);
        }
      });
    });
  }

  if (notification != null) {
    notification.addEventListener("click", () => {
      window.focus();

      globalStore.update((store) => {
        store.activedTaskTabIndex = 0;
      });

      navigate(Route.Task);
    });

    return;
  }

  throw errorPermissionDenied;
}
