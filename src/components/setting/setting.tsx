import React from "react";
import {View, StyleSheet} from "react-native";
import {globalStore, IStore} from "../../store";
import {useRexContext} from "../../store/store";
import {Header} from "../common/header";
import {Select} from "../common/select";
import {useTranslation} from "react-i18next";
import {updateSettings} from "../../db/setting";

interface IProps {}

const langs = ["en_US", "zh_CN"];

export const Setting: React.SFC<IProps> = () => {
  const {t} = useTranslation();
  const {settingsData} = useRexContext((store: IStore) => store);

  function getData() {
    return [
      langs.map((lang) => {
        return {label: t(lang), value: lang};
      }),
    ];
  }

  return (
    <View style={s.container}>
      <Header title="Remember" hideBackButton />
      <View style={s.content}>
        <Select
          title={t("Select language")}
          value={[settingsData.data!.lang]}
          data={getData()}
          label={t("Language")}
          onConfirm={(value) => {
            const lang = value ? value[0] : langs[0];

            globalStore.update((store) => {
              store.settingsData.data!.lang = lang;
            });

            updateSettings({lang});
          }}
        />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: "#fff",
    overflow: "scroll",
  },
});
