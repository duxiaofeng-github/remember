import { getDBInstance } from "./db";
import { getDeviceLocale } from "../utils/locale";

interface Setting {
  lang: string;
  points: number;
}

const tableName = "settings";

function getDefaultSetting(lang: string): Setting {
  return {
    lang,
    points: 0,
  };
}

export async function getSettings(): Promise<Setting> {
  const db = await getDBInstance();
  const table = await db.keyvalue(tableName);
  const data = table.get("settings");

  if (data != null) {
    return data;
  }

  const defaultLang = await getDeviceLocale();

  return getDefaultSetting(defaultLang);
}

export async function updateSettings(data: Setting): Promise<void> {
  const db = await getDBInstance();
  const table = await db.keyvalue(tableName);

  return table.put("settings", data);
}
