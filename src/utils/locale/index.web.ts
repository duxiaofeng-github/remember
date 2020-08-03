import { getLanguages } from "react-native-i18n";

export async function getDeviceLocale() {
  const locales = navigator.languages || navigator.language;

  if (Array.isArray(locales)) {
    return locales[0];
  } else {
    return locales || "en";
  }
}
