/**
 * @format
 */

import {AppRegistry, Platform} from "react-native";
import App from "./App";
import {name as appName} from "./app.json";
import BackgroundFetch from "react-native-background-fetch";
import {timeInterval, notifyTasks} from "./src/utils/scheduler";

AppRegistry.registerComponent(appName, () => App);

if (Platform.OS === "android" || Platform.OS === "ios") {
  BackgroundFetch.registerHeadlessTask(async (event) => {
    let taskId = event.taskId;

    console.log("HeadlessTask start");

    await notifyTasks();

    console.log("HeadlessTask end");

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
      console.log("normal task start");

      await notifyTasks();

      console.log("normal task end");

      BackgroundFetch.finish(taskId);
    },
    (error) => {
      console.error("[js] RNBackgroundFetch failed to start");
    },
  );
} else if (Platform.OS === "web") {
  setTimeout(notifyTasks, timeInterval);
}
