import { getAllUnnotifiedTasks } from "../common";
import { notify } from "../notification";

const timeInterval = 1000 * 60;

async function notifyTasks() {
  setTimeout(notifyTasks, timeInterval);

  const tasks = await getAllUnnotifiedTasks();

  if (tasks.length !== 0) {
    tasks.forEach((item) => {
      item.tasks.forEach((task) => {
        notify(task.content);
      });
    });
  }
}

export const scheduler = {
  check: () => {
    setTimeout(notifyTasks, timeInterval);
  },
};
