import React from "react";
import {View, StyleSheet, ScrollView} from "react-native";
import {globalStore, IStore} from "../../store";
import {useRexContext} from "../../store/store";
import {Header} from "../common/header";
import {SelectField} from "../common/form/select-field";
import {useTranslation} from "react-i18next";
import {updateSettings} from "../../db/setting";
import {DetailField} from "../common/form/detail-field";
import {Popup} from "../common/popup";
import {useSubmission} from "../../utils/hooks/use-submission";
import {Toast} from "../common/toast";

interface IProps {}

const langs = ["en_US", "zh_CN"];

export const Setting: React.SFC<IProps> = () => {
  const {t} = useTranslation();
  const {settingsData} = useRexContext((store: IStore) => store);

  const {triggerer: editPointsTriggerer} = useSubmission(
    async (data?: number) => {
      Toast.message(t("Submitting"), true);

      try {
        await updateSettings({points: data!});

        await settingsData.load();
      } finally {
        Toast.message(t("Edit successfully"));
      }
    },
  );

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
      <ScrollView style={s.content}>
        <SelectField
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
        <DetailField
          label={t("Points")}
          content={`${settingsData.data!.points}`}
          onPress={() => {
            Popup.prompt({
              title: t("Edit points"),
              value: `${settingsData.data!.points}`,
              onConfirm: async (value) => {
                const valueParsed = parseInt(value);

                editPointsTriggerer(valueParsed);
              },
            });
          }}
        />
      </ScrollView>
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
  },
});
