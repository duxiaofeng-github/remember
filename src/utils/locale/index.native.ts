import { getLanguages } from "react-native-i18n";

export async function getDeviceLocale() {
  const langs = await getLanguages();

  if (Array.isArray(langs)) {
    return langs[0];
  } else {
    return langs || "en";
  }
}
