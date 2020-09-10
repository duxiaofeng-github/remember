/**
 * @format
 */

import {AppRegistry, Platform} from "react-native";
import App from "./App";
import {name as appName} from "./app.json";
import BackgroundFetch from "react-native-background-fetch";
import {notifyTasks} from "./src/utils/common";

AppRegistry.registerComponent(appName, () => App);

const timeInterval = Platform.OS === "ios" ? 15 : 1;

  BackgroundFetch.registerHeadlessTask(async (event) => {
    let taskId = event.taskId;

    await notifyTasks();

    BackgroundFetch.finish(taskId);
  });

  BackgroundFetch.configure(
    {
      minimumFetchInterval: timeInterval, // <-- minutes (15 is minimum allowed)
      // Android options
      forceAlarmManager: true, // <-- Set true to bypass JobScheduler.
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
    },
    async (taskId) => {
      await notifyTasks();

      BackgroundFetch.finish(taskId);
    },
    (error) => {
      console.error("[js] RNBackgroundFetch failed to start");
    },
  );
}
