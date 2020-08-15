import { globalStore } from ".";
import { listTasks, ListTaskOptions } from "../db/task";
import { listPlans } from "../db/plan";

export async function loadTasks(options?: ListTaskOptions) {
  globalStore.update((store) => {
    store.tasksData.loading = true;
  });

  try {
    const plans = await listPlans();
    const planIds = plans.map((itme) => itme._id);

    const tasks = await listTasks({ planIds });

    await globalStore.update((store) => {
      store.tasksData.data = tasks;
    });
  } catch (e) {
    await globalStore.update((store) => {
      store.tasksData.error = e;
    });

    throw e;
  } finally {
    await globalStore.update((store) => {
      store.tasksData.loading = false;
    });
  }
}
