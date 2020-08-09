import dayjs from "dayjs";
import { getDb } from "./db";

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

const dbName = "tasks";

export async function listTasks(ids?: string[]): Promise<Task[]> {
  const db = await getDb(dbName, "docs");

  return !ids
    ? db.query(() => true)
    : db.query((item: Task) => {
        return ids.includes(item._id);
      });
}

export async function getTask(id: string): Promise<Task> {
  const db = await getDb(dbName, "docs");

  return db.get(id);
}

export async function createTask(data: TaskBase): Promise<string> {
  const db = await getDb(dbName, "docs");
  const now = dayjs().unix();

  return db.put({ ...data, updatedAt: now, createdAt: now });
}

export async function updateTask(data: Task): Promise<string> {
  const db = await getDb(dbName, "docs");
  const now = dayjs().unix();

  return db.put({ ...data, updatedAt: now });
}

export async function deleteTask(id: string): Promise<string> {
  const db = await getDb(dbName, "docs");

  return db.del(id);
}
