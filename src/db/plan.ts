import { getDb } from "./db";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { isOneTimeSchedule } from "../utils/common";
import cronParser from "cron-parser";

export interface PlanBase {
  content: string;
  schedule: string;
  duration: number;
  repeatEndedDate?: number;
  repeatEndedCount?: number;
  noticeTime?: number;
  pointsPerTask?: number;
  finishedTaskTime?: number[];
  canceledTaskTime?: number[];
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

  return db.get(id);
}

export async function createPlan(data: PlanBase): Promise<string> {
  const db = await getDb(dbName, "docs");

  const newPlan = { ...data, _id: nanoid() };

  return db.put(newPlan);
}

export async function updatePlan(data: Plan): Promise<string> {
  const db = await getDb(dbName, "docs");
  const now = dayjs().unix();

  return db.put({ ...data, updatedAt: now });
}

export async function deletePlan(id: string): Promise<string> {
  const db = await getDb(dbName, "docs");

  return db.del(id);
}

export interface Task {
  planId: string;
  content: string;
  startedAt: number;
  duration: number;
  finished: boolean;
  noticeTime?: number;
  points?: number;
}

function isTaskTimeInRange(
  taskTime: number,
  startTime: number,
  endTime: number,
  noticeTime: number,
  includeNoticeTime: boolean,
) {
  const taskTimeParsed = taskTime - (includeNoticeTime ? noticeTime : 0);

  return taskTimeParsed >= startTime && taskTimeParsed <= endTime;
}

function isTaskFinished(taskTime: number, finishedTaskTime: number[]) {
  return finishedTaskTime.includes(taskTime);
}

function isTaskCanceled(taskTime: number, canceledTaskTime: number[]) {
  return canceledTaskTime.includes(taskTime);
}

function generateTask(options: { plan: Plan; taskTime: number; finished: boolean }) {
  const { plan, taskTime, finished } = options;
  const { _id, content, duration, noticeTime, pointsPerTask } = plan;

  return {
    planId: _id,
    content: content,
    startedAt: taskTime,
    duration: duration,
    finished,
    noticeTime,
    points: pointsPerTask,
  };
}

function isTaskRepeatEnded(
  taskTime: number,
  finishedTaskTime: number[],
  repeatEndedDate?: number,
  repeatEndedCount?: number,
) {
  if (repeatEndedCount != null) {
    return finishedTaskTime.length >= repeatEndedCount;
  } else if (repeatEndedDate != null) {
    return taskTime >= repeatEndedDate;
  }

  return false;
}

function getTask(options: {
  plan: Plan;
  taskTime: number;
  startTime: number;
  endTime: number;
  noticeTime: number;
  includeNoticeTime: boolean;
  finishedTaskTime: number[];
  canceledTaskTime: number[];
  repeatEndedDate?: number;
  repeatEndedCount?: number;
}) {
  const {
    plan,
    taskTime,
    startTime,
    endTime,
    noticeTime,
    includeNoticeTime,
    finishedTaskTime,
    canceledTaskTime,
    repeatEndedDate,
    repeatEndedCount,
  } = options;

  if (!isTaskTimeInRange(taskTime, startTime, endTime, noticeTime, includeNoticeTime)) {
    return false;
  } else {
    const repeatEnded = isTaskRepeatEnded(taskTime, finishedTaskTime, repeatEndedDate, repeatEndedCount);

    if (!repeatEnded) {
      const finished = isTaskFinished(taskTime, finishedTaskTime);
      const canceled = isTaskCanceled(taskTime, canceledTaskTime);

      if (!finished && !canceled) {
        const task = generateTask({ plan, taskTime, finished });

        return task;
      }
    }
  }
}

export function listTasks(options: {
  plan: Plan;
  startTime?: number;
  endTime?: number;
  includeNoticeTime?: boolean;
}): Task[] {
  const plan = options.plan;
  const { startTime = plan.createdAt, endTime = dayjs().unix(), includeNoticeTime = false } = options;
  const {
    schedule,
    finishedTaskTime = [],
    canceledTaskTime = [],
    noticeTime = 0,
    repeatEndedDate,
    repeatEndedCount,
  } = plan;

  const tasks: Task[] = [];

  if (isOneTimeSchedule(schedule)) {
    const taskTime = dayjs(schedule).unix();
    const task = getTask({
      plan,
      taskTime,
      startTime,
      endTime,
      noticeTime,
      includeNoticeTime,
      finishedTaskTime,
      canceledTaskTime,
    });

    if (task != null && task !== false) {
      tasks.push(task);
    }
  } else {
    const cron = cronParser.parseExpression(schedule);

    while (true) {
      try {
        if (cron.hasPrev()) {
          const taskDate = cron.prev().toDate();
          const taskTime = dayjs(taskDate).unix();
          const task = getTask({
            plan,
            taskTime,
            startTime,
            endTime,
            noticeTime,
            includeNoticeTime,
            finishedTaskTime,
            canceledTaskTime,
            repeatEndedDate,
            repeatEndedCount,
          });

          if (task === false) {
            break;
          }

          if (task != null) {
            tasks.push(task);
          }
        } else {
          break;
        }
      } catch (e) {
        break;
      }
    }

    cron.reset();

    while (true) {
      try {
        if (cron.hasNext()) {
          const taskDate = cron.next().toDate();
          const taskTime = dayjs(taskDate).unix();
          const task = getTask({
            plan,
            taskTime,
            startTime,
            endTime,
            noticeTime,
            includeNoticeTime,
            finishedTaskTime,
            canceledTaskTime,
            repeatEndedDate,
            repeatEndedCount,
          });

          if (task === false) {
            break;
          }

          if (task != null) {
            tasks.push(task);
          }
        } else {
          break;
        }
      } catch (e) {
        break;
      }
    }
  }

  return tasks;
}
