import {defaultLocale, getRemoteAddr} from "../utils/common";
import {getData, putData} from "../components/common/orbit-db-bridge/sender";

export interface Setting {
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
  const data = await getData({dbName, remoteAddr, id: "settings"});

  if (data != null && data.length) {
    return data[0];
  }

  return getDefaultSetting(defaultLocale);
}

export async function updateSettings(data: Partial<Setting>): Promise<void> {
  const remoteAddr = await getRemoteAddr();
  const settings = await getSettings();

  return putData({
    dbName,
    remoteAddr,
    data: {_id: "settings", ...settings, ...data},
  });
}

export async function addPoints(points: number): Promise<void> {
  const settings = await getSettings();
  const {points: originPoints, ...restSettings} = settings;

  await updateSettings({...restSettings, points: originPoints + points});
}
