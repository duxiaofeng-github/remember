import {globalStore} from ".";
import {listRewardPlans} from "../db/reward";

export async function loadRewardPlans() {
  globalStore.update((store) => {
    store.rewardPlansData.loading = true;
  });

  try {
    const data = await listRewardPlans();

    await globalStore.update((store) => {
      store.rewardPlansData.data = data;
    });
  } catch (e) {
    await globalStore.update((store) => {
      store.rewardPlansData.error = e;
    });

    throw e;
  } finally {
    await globalStore.update((store) => {
      store.rewardPlansData.loading = false;
    });
  }
}
