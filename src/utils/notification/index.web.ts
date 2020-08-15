const errorPermissionDenied = new Error("Notification permission denied");

export async function notify(message: string): Promise<Notification> {
  const notificationOptions = {};
  let notification: Notification | undefined;

  if (Notification.permission === "granted") {
    notification = new Notification(message, notificationOptions);
  } else if (Notification.permission !== "denied") {
    notification = await new Promise((resolve, reject) => {
      Notification.requestPermission().then((permission: string) => {
        if (permission === "granted") {
          resolve(new Notification(message, notificationOptions));
        } else {
          reject(errorPermissionDenied);
        }
      });
    });
  }

  if (notification != null) {
    notification.addEventListener("click", () => {
      window.focus();
    });

    return notification;
  }

  throw errorPermissionDenied;
}
