import { getRemoteAddr } from "../utils/common";
import { getData, putData } from "../orbit-db/orbit-db";
import { getDeviceLocale } from "../utils/locale";

interface Setting {
  lang: string;
  points: number;
}

const dbName = "settings";

function getDefaultSetting(lang: string): Setting {
  return {
    lang,
    points: 0,
  };
}

export async function getSettings(): Promise<Setting> {
  const remoteAddr = await getRemoteAddr();
  const data = await getData({ dbName, remoteAddr, id: "settings" });

  if (data != null && data.length) {
    return data[0];
  }

  const defaultLang = await getDeviceLocale();

  return getDefaultSetting(defaultLang);
}

export async function updateSettings(data: Setting): Promise<void> {
  const remoteAddr = await getRemoteAddr();
  return putData({ dbName, remoteAddr, data: { _id: "settings", ...data } });
}
