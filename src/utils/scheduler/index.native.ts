import BackgroundFetch from "react-native-background-fetch";
import { getAllUnnotifiedTasks, humanizeRangeTime } from "../common";
import { notify } from "../notification";
import { setNotifiedTasks } from "../../db/plan";

async function notifyTasks() {
  const tasks = await getAllUnnotifiedTasks();

  if (tasks.length !== 0) {
    tasks.forEach((item) => {
      item.tasks.forEach((task) => {
        const { content, startedAt, duration } = task;

        notify(content, humanizeRangeTime(startedAt, duration));
      });

      setNotifiedTasks(
        item.planId,
        item.tasks.map((task) => task.startedAt),
      );
    });
  }
}

export const scheduler = {
  check: () => {
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
        // Android options
        forceAlarmManager: false, // <-- Set true to bypass JobScheduler.
        stopOnTerminate: false,
        startOnBoot: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE, // Default
        requiresCharging: false, // Default
        requiresDeviceIdle: false, // Default
        requiresBatteryNotLow: false, // Default
        requiresStorageNotLow: false, // Default
      },
      async (taskId) => {
        notifyTasks();

        BackgroundFetch.finish(taskId);
      },
      (error) => {
        console.error("[js] RNBackgroundFetch failed to start");
      },
    );
  },
};
