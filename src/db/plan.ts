import { getDb } from "./db";
import dayjs from "dayjs";
import { nanoid } from "nanoid";

export interface PlanBase {
  content: string;
  schedule: string;
  duration: number;
  repeatEndedDate?: number;
  repeatEndedCount?: number;
  noticeTime?: number;
  pointsPerTask?: number;
  finished?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Plan extends PlanBase {
  _id: string;
}

const dbName = "plans";

export async function listPlans(): Promise<Plan[]> {
  const db = await getDb(dbName, "docs");

  return db.query((item: Plan) => true);
}

export async function getPlan(id: string): Promise<Plan> {
  const db = await getDb(dbName, "docs");
  const result = await db.get(id);

  return result && result.length ? result[0] : undefined;
}

export async function createPlan(data: PlanBase): Promise<string> {
  const db = await getDb(dbName, "docs");

  const newPlan = { ...data, _id: nanoid() };

  return db.put(newPlan);
}

export async function updatePlan(data: Plan): Promise<void> {
  const db = await getDb(dbName, "docs");

  return db.put(data);
}

export async function deletePlan(id: string): Promise<void> {
  const db = await getDb(dbName, "docs");

  return db.del(id);
}
