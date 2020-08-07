import { getDBInstance } from "./db";
import dayjs from "dayjs";
import { deleteTask } from "./task";

export interface PlanBase {
  content: string;
  schedule: string;
  duration: number;
  repeatEndedAt?: number;
  repeatEndedCount?: number;
  advanceTime: number;
  pointsPerTask: number;
  taskIds: string[];
}

export interface Plan extends PlanBase {
  _id: string;
  createdAt: number;
  updatedAt: number;
}

const tableName = "plans";

export async function listPlans(): Promise<Plan[]> {
  const db = await getDBInstance();
  const table = await db.docs(tableName);

  return table.query(() => true);
}

export async function getPlan(id: string): Promise<Plan> {
  const db = await getDBInstance();
  const table = await db.docs(tableName);

  return table.get(id);
}

export async function createPlan(data: PlanBase): Promise<string> {
  const db = await getDBInstance();
  const table = await db.docs(tableName);
  const now = dayjs().unix();

  return table.put({ ...data, updatedAt: now, createdAt: now });
}

export async function updatePlan(data: Plan): Promise<string> {
  const db = await getDBInstance();
  const table = await db.docs(tableName);
  const now = dayjs().unix();

  return table.put({ ...data, updatedAt: now });
}

export async function deletePlan(id: string): Promise<string> {
  const db = await getDBInstance();
  const table = await db.docs(tableName);

  const plan = await getPlan(id);
  const taskIds = plan.taskIds;
  const tasksPromise = taskIds.map((id) => {
    return deleteTask(id);
  });

  await Promise.all(tasksPromise);

  return table.del(id);
}
