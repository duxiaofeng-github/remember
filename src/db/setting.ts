import { getDBInstance } from "./db";

interface Setting {
  lang: string;
  points: number;
}

const tableName = "settings";

export async function getSettings(): Promise<Setting> {
  const db = await getDBInstance();
  const table = await db.keyvalue(tableName);

  return table.get("settings");
}

export async function updateSettings(data: Setting): Promise<void> {
  const db = await getDBInstance();
  const table = await db.keyvalue(tableName);

  return table.put("settings", data);
}
