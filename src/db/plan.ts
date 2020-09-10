import dayjs from "dayjs";
import {nanoid} from "nanoid";
import cronParser from "cron-parser";
import {getRemoteAddr, isOneTimeSchedule} from "../utils/common";
import {getData, putData, delData} from "./db";
import {addPoints} from "./setting";
import {isCanceled, isFinished, isPlanFinished, isRepeatEnded} from "./utils";

export interface PlanBase {
  content: string;
  schedule: string;
  duration: number;
  count: number;
  repeatEndedDate?: number;
  repeatEndedCount?: number;
  noticeTime?: number;
  points?: number;
  finishedTime?: number[];
  canceledTime?: number[];
  notifiedTime?: number[];
  createdAt: number;
  updatedAt: number;
}

export interface Plan extends PlanBase {
  _id: string;
}

const dbName = "plans";

export async function listPlans(options?: {
  all?: boolean;
  finished?: boolean;
}): Promise<Plan[]> {
  const {all, finished = false} = options || {};
  const remoteAddr = await getRemoteAddr();
  const data = await getData({dbName, remoteAddr});

  return data.filter((plan: Plan) => {
    const {
      schedule,
      finishedTime,
      canceledTime,
      count,
      repeatEndedCount,
      repeatEndedDate,
    } = plan;

    if (all) {
      return true;
    } else if (finished === true) {
      return isPlanFinished({
        schedule,
        finishedTime,
        canceledTime,
        count,
        repeatEndedDate,
        repeatEndedCount,
      });
    } else if (finished === false) {
      return !isPlanFinished({
        schedule,
        finishedTime,
        canceledTime,
        count,
        repeatEndedDate,
        repeatEndedCount,
      });
    }

    return true;
  });
}

export async function getPlan(id: string): Promise<Plan> {
  const remoteAddr = await getRemoteAddr();
  const data = await getData({dbName, remoteAddr, id});

  return data;
}

export async function createPlan(data: PlanBase): Promise<void> {
  const remoteAddr = await getRemoteAddr();
  const newPlan = {...data, _id: nanoid()};

  return putData({dbName, remoteAddr, data: newPlan});
}

export async function updatePlan(data: Plan): Promise<void> {
  const remoteAddr = await getRemoteAddr();

  return putData({dbName, remoteAddr, data});
}

export async function deletePlan(id: string): Promise<void> {
  const remoteAddr = await getRemoteAddr();

  return delData({dbName, remoteAddr, id});
}

export async function finishTask(
  planId: string,
  taskTime: number,
): Promise<void> {
  const plan = await getPlan(planId);
  const finishedTime = plan.finishedTime || [];

  finishedTime.push(taskTime);

  await addPoints(plan.points || 0);

  await updatePlan({...plan, finishedTime});
}

export async function cancelTask(
  planId: string,
  taskTime: number,
): Promise<void> {
  const plan = await getPlan(planId);
  const canceledTime = (plan.canceledTime || []).filter(
    (item) => item !== taskTime,
  );

  canceledTime.push(taskTime);

  await updatePlan({...plan, canceledTime});
}

export async function setNotifiedTasks(
  planId: string,
  taskTimes: number[],
): Promise<void> {
  const plan = await getPlan(planId);
  let notifiedTaskTime = plan.notifiedTime || [];

  notifiedTaskTime = notifiedTaskTime.concat(taskTimes);

  await updatePlan({...plan, notifiedTime: notifiedTaskTime});
}

export interface Task {
  planId: string;
  content: string;
  startedAt: number;
  duration: number;
  finished: boolean;
  noticeTime?: number;
  plan: Plan;
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

function generateTask(options: {
  plan: Plan;
  taskTime: number;
  finished: boolean;
}): Task {
  const {plan, taskTime, finished} = options;
  const {_id, content, duration, noticeTime} = plan;

  return {
    planId: _id,
    content: content,
    startedAt: taskTime,
    duration: duration,
    finished,
    noticeTime,
    plan,
  };
}

function getTask(options: {
  plan: Plan;
  taskTime: number;
  startTime: number;
  endTime: number;
  count: number;
  noticeTime: number;
  includeNoticeTime: boolean;
  finishedTime: number[];
  canceledTime: number[];
  repeatEndedDate?: number;
  repeatEndedCount?: number;
}) {
  const {
    plan,
    taskTime,
    startTime,
    endTime,
    count,
    noticeTime,
    includeNoticeTime,
    finishedTime,
    canceledTime,
    repeatEndedDate,
    repeatEndedCount,
  } = options;

  if (
    !isTaskTimeInRange(
      taskTime,
      startTime,
      endTime,
      noticeTime,
      includeNoticeTime,
    )
  ) {
    return false;
  } else {
    const repeatEnded = isRepeatEnded(
      taskTime,
      finishedTime,
      repeatEndedDate,
      repeatEndedCount,
    );

    if (!repeatEnded) {
      const finished = isFinished(taskTime, count, finishedTime);
      const canceled = isCanceled(taskTime, canceledTime);

      if (!finished && !canceled) {
        const task = generateTask({plan, taskTime, finished});

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
  const {
    startTime = plan.createdAt,
    endTime = dayjs().unix(),
    includeNoticeTime = false,
  } = options;
  const {
    schedule,
    count,
    finishedTime = [],
    canceledTime = [],
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
      count,
      noticeTime,
      includeNoticeTime,
      finishedTime,
      canceledTime,
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
            count,
            noticeTime,
            includeNoticeTime,
            finishedTime,
            canceledTime,
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
            count,
            noticeTime,
            includeNoticeTime,
            finishedTime,
            canceledTime,
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

export function listUnnotifiedTasks(options: {plan: Plan}): Task[] {
  const {plan} = options;
  const tasks = listTasks({plan, includeNoticeTime: true});

  const unnotifiedTasks = tasks.filter((task) => {
    const notifiedTaskTime = plan.notifiedTime || [];
    return !notifiedTaskTime.includes(task.startedAt);
  });

  return unnotifiedTasks;
}
