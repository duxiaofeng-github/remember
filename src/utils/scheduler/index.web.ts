import { getAllUnnotifiedTasks } from "../common";
import { notify } from "../notification";
import { setNotifiedTasks } from "../../db/plan";

const timeInterval = 1000 * 60;

async function notifyTasks() {
  setTimeout(notifyTasks, timeInterval);

  const tasks = await getAllUnnotifiedTasks();

  if (tasks.length !== 0) {
    tasks.forEach((item) => {
      item.tasks.forEach((task) => {
        notify(task.content);
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
    setTimeout(notifyTasks, timeInterval);
  },
};
