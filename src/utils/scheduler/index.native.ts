import BackgroundFetch from "react-native-background-fetch";
import {getAllUnnotifiedTasks, getRangeTime} from "../common";
import {notify} from "../notification";
import {setNotifiedTasks} from "../../db/plan";
import i18n from "../../i18n";

async function notifyTasks() {
  const tasks = await getAllUnnotifiedTasks();

  if (tasks.length !== 0) {
    tasks.forEach((item) => {
      item.tasks.forEach((task) => {
        const {content, startedAt, duration} = task;

        notify(content, i18n.t("from to", getRangeTime(startedAt, duration)));
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
    const handleTask = async (taskId: string) => {
      console.log("job start");

      await notifyTasks();

      console.log("job end");

      BackgroundFetch.finish(taskId);
    };

    BackgroundFetch.registerHeadlessTask((event) => {
      let taskId = event.taskId;

      handleTask(taskId);
    });

    BackgroundFetch.configure(
      {
        minimumFetchInterval: 1, // <-- minutes (15 is minimum allowed)
        // Android options
        forceAlarmManager: true, // <-- Set true to bypass JobScheduler.
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
      },
      handleTask,
      (error) => {
        console.error("[js] RNBackgroundFetch failed to start");
      },
    );
  },
};
