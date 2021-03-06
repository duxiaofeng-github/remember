import cronstrue from "cronstrue/i18n";
import dayjs, {Dayjs} from "dayjs";
import * as RNLocalize from "react-native-localize";

import {globalStore} from "../store";
import {listPlans, listUnnotifiedTasks} from "../db/plan";
import {storage} from "./storage";
import {notify} from "./notification";
import i18n from "../i18n";
import {setNotifiedTasks} from "../db/plan";
import {getSettings} from "../db/setting";
import kebabCase from "lodash/kebabCase";
import {isPcronExpression} from "./cron";

const locales = RNLocalize.getLocales();
export const defaultLocale =
  locales && locales[0] ? locales[0].languageTag.replace("-", "_") : "en";

export function humanizeCron(cron: string) {
  try {
    return cronstrue.toString(cron, {
      locale: globalStore.getState().settingsData.data!.lang.replace("-", "_"),
    });
  } catch (e) {
    return cron;
  }
}

export function getOneTimeScheduleStartTime(schedule: string) {
  return dayjs(schedule).unix();
}

export function getOneTimeScheduleEndTime(schedule: string, duration: number) {
  return dayjs
    .unix(getOneTimeScheduleStartTime(schedule))
    .add(duration, "second")
    .unix();
}

export function isOneTimeSchedule(schedule: string) {
  if (isPcronExpression(schedule)) {
    return false;
  }

  const scheduleArray = schedule.split(" ");

  return scheduleArray.length !== 5;
}

export function parseSchedule(schedule: string) {
  const [minute, hour, date, month, day] = schedule.split(" ");

  return {minute, hour, date, month, day};
}

export function getRangeTime(time: string | number, duration: number) {
  const timeParsed = typeof time === "string" ? dayjs(time) : dayjs.unix(time);
  const from = formatTime(timeParsed);
  const to = formatTime(timeParsed.add(duration, "second"));

  return {from, to};
}

export function isTimeout(time: string | number, duration: number) {
  const startTime = typeof time === "string" ? dayjs(time) : dayjs.unix(time);
  const endTime = startTime.add(duration, "second");

  return endTime.isBefore(dayjs());
}

function isIntegerString(str: string) {
  return /^[0-9]+$/.test(str);
}

export function isDailySchedule(schedule: string) {
  if (isPcronExpression(schedule)) {
    return false;
  }

  const [min, hour, date, month, day] = schedule.split(" ");

  return (
    isIntegerString(min) &&
    isIntegerString(hour) &&
    date === "*" &&
    month === "*" &&
    day === "*"
  );
}

export function isWeeklySchedule(schedule: string) {
  if (isPcronExpression(schedule)) {
    return false;
  }

  const [min, hour, date, month, day] = schedule.split(" ");

  return (
    isIntegerString(min) &&
    isIntegerString(hour) &&
    day !== "*" &&
    date === "*" &&
    month === "*"
  );
}

export function isMonthlySchedule(schedule: string) {
  if (isPcronExpression(schedule)) {
    return false;
  }

  const [min, hour, date, month, day] = schedule.split(" ");

  return (
    isIntegerString(min) &&
    isIntegerString(hour) &&
    date !== "*" &&
    day === "*" &&
    month === "*"
  );
}

export function formatTime(time: Dayjs | number | string, layout?: string) {
  const timeParsed =
    typeof time === "string"
      ? dayjs(time)
      : typeof time === "number"
      ? dayjs.unix(time)
      : time;

  return timeParsed.format(layout || "L LT");
}

export function secondsToDuration(seconds: number) {
  return dayjs.duration(seconds, "second");
}

export async function getAllUnnotifiedTasks(foreground: boolean) {
  if (foreground) {
    await globalStore.getState().plansData.load();
  }

  const plans = foreground
    ? globalStore.getState().plansData.data!
    : await listPlans();

  const tasksArray = plans
    .filter((item) => item.noticeTime != null)
    .map((plan) => {
      return {planId: plan._id, tasks: listUnnotifiedTasks({plan})};
    });

  return tasksArray;
}

export async function getRemoteAddr() {
  const addr = await storage.getItem("remember-remote-db-addr");

  return addr || "";
}

export async function notifyTasks(foreground: boolean) {
  if (!foreground) {
    const {lang} = await getSettings();

    i18n.changeLanguage(lang);

    dayjs.locale(kebabCase(lang.toLowerCase()));
  }

  const tasks = await getAllUnnotifiedTasks(foreground);

  if (tasks.length !== 0) {
    tasks.forEach((item) => {
      item.tasks.forEach((task) => {
        const {content, startedAt} = task;

        notify(content, i18n.t("Begin at time", {time: formatTime(startedAt)}));
      });

      setNotifiedTasks(
        item.planId,
        item.tasks.map((task) => task.startedAt),
      );
    });
  }
}

export function humanizeCount(options: {
  time: number;
  finishedTime?: number[];
  count: number;
}) {
  const {time, finishedTime = [], count} = options;
  const finishedCount = finishedTime.filter((item) => item === time).length;

  return `(${finishedCount}/${count})`;
}
