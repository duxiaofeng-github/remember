import { getDb } from "./db";
import dayjs from "dayjs";
import { deleteTask } from "./task";
import { nanoid } from "nanoid";

export interface PlanBase {
  content: string;
  schedule: string;
  duration: number;
  repeatEndedAt?: number;
  repeatEndedCount?: number;
  noticeDuration?: number;
  pointsPerTask?: number;
  taskIds?: string[];
}

export interface Plan extends PlanBase {
  _id: string;
  createdAt: number;
  updatedAt: number;
}

const dbName = "plans";

export async function listPlans(): Promise<Plan[]> {
  const db = await getDb(dbName, "docs");

  return db.query((item: Plan) => true);
}

export async function getPlan(id: string): Promise<Plan> {
  const db = await getDb(dbName, "docs");

  return db.get(id);
}

export async function createPlan(data: PlanBase): Promise<string> {
  const db = await getDb(dbName, "docs");

  const now = dayjs().unix();
  const newPlan = { ...data, _id: nanoid(), updatedAt: now, createdAt: now };

  return db.put(newPlan);
}

export async function updatePlan(data: Plan): Promise<string> {
  const db = await getDb(dbName, "docs");
  const now = dayjs().unix();

  return db.put({ ...data, updatedAt: now });
}

export async function deletePlan(id: string): Promise<string> {
  const db = await getDb(dbName, "docs");

  const plan = await getPlan(id);
  const taskIds = plan.taskIds;

  if (taskIds) {
    const tasksPromise = taskIds.map((id) => {
      return deleteTask(id);
    });

    await Promise.all(tasksPromise);
  }

  return db.del(id);
}
