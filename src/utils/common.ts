import I18n from "react-native-i18n";
import cronstrue from "cronstrue";
import { globalStore } from "../store";
import _humanizeDuration from "humanize-duration";

export function translate(key: string) {
  return I18n.t(key);
}

export function humanizeCron(cron: string) {
  return cronstrue.toString(cron, { locale: globalStore.getState().lang });
}

export function humanizeDuration(duration: number) {
  return _humanizeDuration(duration, { language: "es" });
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
