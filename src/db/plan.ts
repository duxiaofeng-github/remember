import dayjs from "dayjs";
import {nanoid} from "nanoid";
import cronParser from "cron-parser";
import {getRemoteAddr, isOneTimeSchedule} from "../utils/common";
import {
  getData,
  putData,
  delData,
} from "../components/common/orbit-db-bridge/sender";

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
  notifiedTaskTime?: number[];
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
    if (all) {
      return true;
    } else if (finished === true) {
      return isPlanFinished(plan);
    } else if (finished === false) {
      return !isPlanFinished(plan);
    }

    return true;
  });
}

export async function getPlan(id: string): Promise<Plan> {
  const remoteAddr = await getRemoteAddr();
  const data = await getData({dbName, remoteAddr, id});

  return data && data.length ? data[0] : undefined;
}

export async function createPlan(data: PlanBase): Promise<string> {
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
  const finishedTaskTime = (plan.finishedTaskTime || []).filter(
    (item) => item !== taskTime,
  );

  finishedTaskTime.push(taskTime);

  await updatePlan({...plan, finishedTaskTime});
}

export async function cancelTask(
  planId: string,
  taskTime: number,
): Promise<void> {
  const plan = await getPlan(planId);
  const canceledTaskTime = (plan.canceledTaskTime || []).filter(
    (item) => item !== taskTime,
  );

  canceledTaskTime.push(taskTime);

  await updatePlan({...plan, canceledTaskTime});
}

export async function setNotifiedTasks(
  planId: string,
  taskTimes: number[],
): Promise<void> {
  const plan = await getPlan(planId);
  let notifiedTaskTime = plan.notifiedTaskTime || [];

  notifiedTaskTime = notifiedTaskTime.concat(taskTimes);

  await updatePlan({...plan, notifiedTaskTime});
}

export function isPlanFinished(plan: Plan) {
  const {
    schedule,
    repeatEndedCount,
    repeatEndedDate,
    canceledTaskTime,
    finishedTaskTime,
  } = plan;

  if (isOneTimeSchedule(schedule)) {
    return (finishedTaskTime || []).length > 0;
  } else if (repeatEndedCount != null) {
    return (finishedTaskTime || []).length >= repeatEndedCount;
  } else if (repeatEndedDate != null) {
    const allTaskTimes = (finishedTaskTime || []).concat(
      canceledTaskTime || [],
    );

    if (allTaskTimes.length > 0) {
      allTaskTimes.sort((a, b) => b - a);

      const latestTaskTime = allTaskTimes[0];
      const cron = cronParser.parseExpression(schedule, {
        currentDate: dayjs.unix(latestTaskTime).toDate(),
      });
      const nextTime = cron.hasNext()
        ? dayjs(cron.next().toDate()).unix()
        : undefined;

      if (nextTime != null && nextTime >= repeatEndedDate) {
        return true;
      }
    }
  }

  return false;
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

function generateTask(options: {
  plan: Plan;
  taskTime: number;
  finished: boolean;
}) {
  const {plan, taskTime, finished} = options;
  const {_id, content, duration, noticeTime, pointsPerTask} = plan;

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
    const repeatEnded = isTaskRepeatEnded(
      taskTime,
      finishedTaskTime,
      repeatEndedDate,
      repeatEndedCount,
    );

    if (!repeatEnded) {
      const finished = isTaskFinished(taskTime, finishedTaskTime);
      const canceled = isTaskCanceled(taskTime, canceledTaskTime);

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

export function listUnnotifiedTasks(options: {plan: Plan}): Task[] {
  const {plan} = options;
  const tasks = listTasks({plan, includeNoticeTime: true});
  const unnotifiedTasks = tasks.filter((task) => {
    const notifiedTaskTime = plan.notifiedTaskTime || [];
    return !notifiedTaskTime.includes(task.startedAt);
  });

  return unnotifiedTasks;
}
