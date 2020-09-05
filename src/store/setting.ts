import {globalStore} from ".";
import {getSettings} from "../db/setting";

export async function loadSettings() {
  globalStore.update((store) => {
    store.settingsData.loading = true;
  });

  try {
    const data = await getSettings();

    await globalStore.update((store) => {
      store.settingsData.data = data;
    });
  } catch (e) {
    await globalStore.update((store) => {
      store.settingsData.error = e;
    });

    throw e;
  } finally {
    await globalStore.update((store) => {
      store.settingsData.loading = false;
    });
  }
}
