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
  return dayjs.unix(getOneTimeScheduleStartTime(schedule)).add(duration, "second").unix();
}

export function isOneTimeSchedule(schedule: string) {
  const scheduleArray = schedule.split(" ");

  return scheduleArray.length !== 5;
}

export function humanizeOneTimeSchedule(schedule: string, duration: number) {
  const from = formatTime(dayjs(schedule));
  const to = formatTime(dayjs(schedule).add(duration, "second"));

  return translate("fromTimeToTime", { from, to });
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
