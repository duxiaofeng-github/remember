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
