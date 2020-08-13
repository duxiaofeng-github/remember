import I18n from "react-native-i18n";
import { TranslateOptions } from "i18n-js";
import cronstrue from "cronstrue/i18n";
import { globalStore } from "../store";
import dayjs, { Dayjs } from "dayjs";

export function translate(key: string, options?: TranslateOptions) {
  return I18n.t(key, options);
}

export function humanizeCron(cron: string) {
  return cronstrue.toString(cron, { locale: globalStore.getState().lang.replace("-", "_") });
}

export function getOneTimeScheduleStartTime(schedule: string) {
  return dayjs(schedule).unix();
}

export function getOneTimeScheduleEndTime(schedule: string, duration: number) {
  return dayjs.unix(getOneTimeScheduleStartTime(schedule)).add(duration, "second").unix();
}

export function isOneTimeSchedule(schedule: string) {
  const scheduleArray = schedule.split(" ");

  return scheduleArray.length !== 5;
}

export function parseSchedule(schedule: string) {
  const [minute, hour, date, month, day] = schedule.split(" ");

  return { minute, hour, date, month, day };
}

export function humanizeRangeTime(time: string | number, duration: number) {
  const timeParsed = typeof time === "string" ? dayjs(time) : dayjs.unix(time);
  const from = formatTime(timeParsed);
  const to = formatTime(timeParsed.add(duration, "second"));

  return translate("%{from} to %{to}", { from, to });
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
