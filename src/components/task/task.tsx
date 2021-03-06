import React from "react";
import {View, StyleSheet} from "react-native";
import {Header} from "../common/header";
import {useTranslation} from "react-i18next";
import {Tabs} from "../common/tabs";
import {ProcessingTasks} from "./processing-tasks";
import {Route} from "../../utils/route";
import {useNavigation} from "@react-navigation/native";
import {AllTasks} from "./all-tasks";
import {Calendar} from "./calendar";
import {EditTaskNavigationProp} from "./edit-task";
import {globalStore, IStore} from "../../store";
import {useRexContext} from "../../store/store";

interface IProps {}

export const Task: React.SFC<IProps> = () => {
  const navigation = useNavigation<EditTaskNavigationProp>();
  const {t} = useTranslation();
  const {activedTaskTabIndex} = useRexContext((store: IStore) => store);

  return (
    <View style={s.container}>
      <Header
        title="Remember"
        hideBackButton
        createButton={{
          visible: true,
          onTouchEnd: () => {
            navigation.navigate(Route.EditTask, {});
          },
        }}
      />
      <Tabs
        tabs={[
          {title: t("Processing"), content: <ProcessingTasks />},
          {title: t("Calendar"), content: <Calendar />},
          {title: t("All tasks"), content: <AllTasks />},
        ]}
        activedIndex={activedTaskTabIndex}
        onIndexChange={(index) => {
          globalStore.update((store) => {
            store.activedTaskTabIndex = index;
          });
        }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
});
