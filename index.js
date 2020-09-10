/**
 * @format
 */

import {AppRegistry, AppState, Platform} from "react-native";
import App from "./App";
import {name as appName} from "./app.json";
import BackgroundFetch from "react-native-background-fetch";
import {notifyTasks} from "./src/utils/common";

AppRegistry.registerComponent(appName, () => App);

const timeInterval = Platform.OS === "ios" ? 15 : 1;

BackgroundFetch.registerHeadlessTask(async (event) => {
  let taskId = event.taskId;

  console.log("headless task start");

  await notifyTasks(false);

  console.log("headless task end");

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

    await notifyTasks(AppState.currentState === "active");

    console.log("normal task end");

    BackgroundFetch.finish(taskId);
  },
  (error) => {
    console.error("[js] RNBackgroundFetch failed to start");
  },
);
