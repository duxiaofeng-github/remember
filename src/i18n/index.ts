import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import {defaultLocale} from "../utils/common";
import {en, zhCN} from "./locales";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {translation: en},
      en_US: {translation: en},
      zh_CN: {translation: zhCN},
    },
    lng: defaultLocale,
    keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
