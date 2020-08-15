import { getDb } from "./db";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { isOneTimeSchedule } from "../utils/common";
import cronParser from "cron-parser";
import { Plan } from "./plan";

export enum TaskStatus {
  Inited = 1,
  Canceled,
  Finished,
}

export interface TaskBase {
  planId: string;
  content: string;
  startedAt: number;
  duration: number;
  status: TaskStatus;
  notified?: boolean;
  noticeTime?: number;
  points?: number;
}

export interface Task extends TaskBase {
  _id: string;
}

const dbName = "tasks";

export interface ListTaskOptions {
  planId?: string;
  planIds?: string[];
  status?: TaskStatus[];
}

export async function listTasks(options?: ListTaskOptions): Promise<Task[]> {
  const { planId, planIds, status = [TaskStatus.Inited] } = options || {};
  const db = await getDb(dbName, "docs");

  return db.query((item: Task) => {
    let result = true;

    if (planId) {
      result = item.planId === planId;
    } else if (planIds) {
      result = planIds.includes(item.planId);
    }

    if (status) {
      result = status.includes(item.status);
    }

    return result;
  });
}

export async function getTask(id: string): Promise<Task> {
  const db = await getDb(dbName, "docs");
  const result = await db.get(id);

  return result && result.length ? result[0] : undefined;
}

export async function createTask(data: TaskBase): Promise<string> {
  const db = await getDb(dbName, "docs");

  const newTask = { ...data, _id: nanoid() };

  return db.put(newTask);
}

export async function updateTask(data: Task): Promise<void> {
  const db = await getDb(dbName, "docs");
  const now = dayjs().unix();

  return db.put({ ...data, updatedAt: now });
}

export async function deleteTask(id?: string): Promise<void> {
  const db = await getDb(dbName, "docs");

  return db.del(id);
}

export async function finishTask(taskId: string): Promise<void> {
  const task = await getTask(taskId);

  await updateTask({ ...task, status: TaskStatus.Finished });
}

export async function cancelTask(taskId: string): Promise<void> {
  const task = await getTask(taskId);

  await updateTask({ ...task, status: TaskStatus.Canceled });
}

// export async function setNotifiedTasks(planId: string, taskTimes: number[]): Promise<void> {
//   const plan = await getPlan(planId);
//   let notifiedTaskTime = plan.notifiedTaskTime || [];

//   notifiedTaskTime = notifiedTaskTime.concat(taskTimes);

//   await updatePlan({ ...plan, notifiedTaskTime });
// }

function isTaskTimeInRange(taskTime: number, startTime: number, endTime: number, noticeTime?: number) {
  const taskTimeParsed = noticeTime ? taskTime - noticeTime : taskTime;

  return taskTimeParsed >= startTime && taskTimeParsed <= endTime;
}

function isTaskFinished(taskTime: number, existedTasks?: Task[]) {
  return existedTasks != null ? existedTasks.map((item) => item.startedAt).includes(taskTime) : false;
}

function isTaskCanceled(taskTime: number, existedTasks?: Task[]) {
  return existedTasks != null ? existedTasks.map((item) => item.startedAt).includes(taskTime) : false;
}

function generateTask(options: { plan: Plan; taskTime: number }) {
  const { plan, taskTime } = options;
  const { _id, content, duration, noticeTime, pointsPerTask } = plan;

  return {
    planId: _id,
    content: content,
    startedAt: taskTime,
    duration: duration,
    status: TaskStatus.Inited,
    notified: false,
    noticeTime,
    points: pointsPerTask,
  };
}

function isTaskRepeatEnded(
  taskTime: number,
  existedTasks?: Task[],
  repeatEndedDate?: number,
  repeatEndedCount?: number,
) {
  if (repeatEndedCount != null && existedTasks != null) {
    return existedTasks.length >= repeatEndedCount;
  } else if (repeatEndedDate != null) {
    return taskTime >= repeatEndedDate;
  }

  return false;
}

function getNewTask(options: {
  plan: Plan;
  taskTime: number;
  startTime: number;
  endTime: number;
  noticeTime?: number;
  existedTasks?: Task[];
  repeatEndedDate?: number;
  repeatEndedCount?: number;
}) {
  const { plan, taskTime, startTime, endTime, noticeTime, existedTasks, repeatEndedDate, repeatEndedCount } = options;

  if (!isTaskTimeInRange(taskTime, startTime, endTime, noticeTime)) {
    return false;
  } else {
    const repeatEnded = isTaskRepeatEnded(taskTime, existedTasks, repeatEndedDate, repeatEndedCount);

    if (!repeatEnded) {
      const finished = isTaskFinished(taskTime, existedTasks);
      const canceled = isTaskCanceled(taskTime, existedTasks);

      if (!finished && !canceled) {
        const task = generateTask({ plan, taskTime });

        return task;
      }
    }
  }
}

export async function listNewTasks(options: { plan: Plan; startTime?: number; endTime?: number }): Promise<TaskBase[]> {
  const plan = options.plan;
  const { startTime = plan.createdAt, endTime = dayjs().unix() } = options;
  const { schedule, noticeTime, repeatEndedDate, repeatEndedCount } = plan;

  const existedTasks = await listTasks({ planId: plan._id });
  const result: TaskBase[] = [];

  if (isOneTimeSchedule(schedule)) {
    const taskTime = dayjs(schedule).unix();
    const task = getNewTask({
      plan,
      taskTime,
      startTime,
      endTime,
      noticeTime,
    });

    if (task != null && task !== false) {
      result.push(task);
    }
  } else {
    const cron = cronParser.parseExpression(schedule);

    while (true) {
      try {
        if (cron.hasPrev()) {
          const taskDate = cron.prev().toDate();
          const taskTime = dayjs(taskDate).unix();
          const task = getNewTask({
            plan,
            taskTime,
            startTime,
            endTime,
            noticeTime,
            existedTasks,
            repeatEndedDate,
            repeatEndedCount,
          });

          if (task === false) {
            break;
          }

          if (task != null) {
            result.push(task);
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
          const task = getNewTask({
            plan,
            taskTime,
            startTime,
            endTime,
            noticeTime,
            existedTasks,
            repeatEndedDate,
            repeatEndedCount,
          });

          if (task === false) {
            break;
          }

          if (task != null) {
            result.push(task);
          }
        } else {
          break;
        }
      } catch (e) {
        break;
      }
    }
  }

  return result;
}
