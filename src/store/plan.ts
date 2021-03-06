import {globalStore} from ".";
import {listPlans} from "../db/plan";

export async function loadPlans() {
  globalStore.update((store) => {
    store.plansData.loading = true;
  });

  try {
    const data = await listPlans();

    await globalStore.update((store) => {
      store.plansData.data = data;
    });
  } catch (e) {
    await globalStore.update((store) => {
      store.plansData.error = e;
    });

    throw e;
  } finally {
    await globalStore.update((store) => {
      store.plansData.loading = false;
    });
  }
}
