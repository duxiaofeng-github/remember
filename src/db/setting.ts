import { getDeviceLocale } from "../utils/locale";
import { getDb } from "./db";

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
  const db = await getDb(dbName, "kv");

  const data = db.get("settings");

  if (data != null) {
    return data;
  }

  const defaultLang = await getDeviceLocale();

  return getDefaultSetting(defaultLang);
}

export async function updateSettings(data: Setting): Promise<void> {
  const db = await getDb(dbName, "kv");

  return db.put("settings", data);
}
