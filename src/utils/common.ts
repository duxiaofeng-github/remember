import I18n from "react-native-i18n";
import { TranslateOptions } from "i18n-js";
import cronstrue from "cronstrue";
import { globalStore } from "../store";
import dayjs, { Dayjs } from "dayjs";

export function translate(key: string, options?: TranslateOptions) {
  return I18n.t(key, options);
}

export function humanizeCron(cron: string) {
  return cronstrue.toString(cron, { locale: globalStore.getState().lang });
}

export function getOneTimeScheduleStartTime(schedule: string) {
  return dayjs(schedule).unix();
}

export function getOneTimeScheduleEndTime(schedule: string, duration: number) {
  return dayjs(getOneTimeScheduleStartTime(schedule) + duration).unix();
}

export function isOneTimeSchedule(schedule: string) {
  const [min, hour, day, month, week] = schedule.split(" ");

  return min !== "*" && hour !== "*" && day !== "*" && week !== "*" && month !== "*";
}

export function isDailySchedule(schedule: string) {
  const [min, hour, day, month, week] = schedule.split(" ");

  return day === "*" && week === "*" && month === "*";
}

export function isWeeklySchedule(schedule: string) {
  const [min, hour, day, month, week] = schedule.split(" ");

  return day !== "*" && week === "*" && month === "*";
}

export function isMonthlySchedule(schedule: string) {
  const [min, hour, day, month, week] = schedule.split(" ");

  return day !== "*" && week !== "*" && month === "*";
}

export function formatTime(time: Dayjs, layout?: string) {
  return time.format(layout || "L LT");
}

export function secondsToDuration(seconds: number) {
  return dayjs.duration(seconds, "second");
}
