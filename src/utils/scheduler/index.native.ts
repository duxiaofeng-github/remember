import {getAllUnnotifiedTasks, getRangeTime} from "../common";
import {notify} from "../notification";
import {setNotifiedTasks} from "../../db/plan";
import i18n from "../../i18n";
import {Platform} from "react-native";

export const timeInterval = Platform.OS === "android" ? 1 : 15;

export async function notifyTasks() {
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
