import cronstrue from "cronstrue/i18n";
import {useTranslation} from "react-i18next";
import {TOptions} from "i18next";
import dayjs, {Dayjs} from "dayjs";
import * as Localization from "expo-localization";

import {globalStore} from "../store";
import {listPlans, listUnnotifiedTasks} from "../db/plan";
import {storage} from "./storage";

export const defaultLocale = Localization.locale || "en";

export function translate<T extends object = {[key: string]: any}>(
  key: string,
  options?: TOptions<T> | string,
) {
  const {t} = useTranslation();

  return t(key, options);
}

export function humanizeCron(cron: string) {
  return cronstrue.toString(cron, {
    locale: globalStore.getState().lang.replace("-", "_"),
  });
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
  const scheduleArray = schedule.split(" ");

  return scheduleArray.length !== 5;
}

export function parseSchedule(schedule: string) {
  const [minute, hour, date, month, day] = schedule.split(" ");

  return {minute, hour, date, month, day};
}

export function humanizeRangeTime(time: string | number, duration: number) {
  const timeParsed = typeof time === "string" ? dayjs(time) : dayjs.unix(time);
  const from = formatTime(timeParsed);
  const to = formatTime(timeParsed.add(duration, "second"));

  return translate("%{from} to %{to}", {from, to});
}

export function isTimeout(time: string | number, duration: number) {
  const startTime = typeof time === "string" ? dayjs(time) : dayjs.unix(time);
  const endTime = startTime.add(duration, "second");

  return endTime.isBefore(dayjs());
}

export function isDailySchedule(schedule: string) {
  const [min, hour, date, month, day] = schedule.split(" ");

  return date === "*" && month === "*" && day === "*";
}

export function isWeeklySchedule(schedule: string) {
  const [min, hour, date, month, day] = schedule.split(" ");

  return day !== "*" && date === "*" && month === "*";
}

export function isMonthlySchedule(schedule: string) {
  const [min, hour, date, month, day] = schedule.split(" ");

  return date !== "*" && day === "*" && month === "*";
}

export function formatTime(time: Dayjs, layout?: string) {
  return time.format(layout || "L LT");
}

export function secondsToDuration(seconds: number) {
  return dayjs.duration(seconds, "second");
}

export async function getAllUnnotifiedTasks() {
  const plans = await listPlans();
  const tasksArray = plans.map((plan) => {
    return {planId: plan._id, tasks: listUnnotifiedTasks({plan})};
  });

  return tasksArray;
}

export async function getRemoteAddr() {
  const addr = await storage.getItem("remember-remote-db-addr");

  return addr || "";
}
