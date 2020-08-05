import { getDBInstance } from "./db";
import dayjs from "dayjs";

export interface TaskBase {
  planId: string;
  startedAt: number;
  duration: number;
  delay: number;
  finished: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Task extends TaskBase {
  _id: string;
  createdAt: number;
  updatedAt: number;
}

const tableName = "tasks";

export async function listTasks(ids?: string[]): Promise<Task[]> {
  const db = await getDBInstance();
  const table = await db.docs(tableName);

  return !ids
    ? table.query(() => true)
    : table.query((item: Task) => {
        return ids.includes(item._id);
      });
}

export async function getTask(id: string): Promise<Task> {
  const db = await getDBInstance();
  const table = await db.docs(tableName);

  return table.get(id);
}

export async function createTask(data: TaskBase): Promise<string> {
  const db = await getDBInstance();
  const table = await db.docs(tableName);
  const now = dayjs().unix();

  return table.put({ ...data, updatedAt: now, createdAt: now });
}

export async function updateTask(data: Task): Promise<string> {
  const db = await getDBInstance();
  const table = await db.docs(tableName);
  const now = dayjs().unix();

  return table.put({ ...data, updatedAt: now });
}

export async function deleteTask(id: string): Promise<string> {
  const db = await getDBInstance();
  const table = await db.docs(tableName);

  return table.del(id);
}
