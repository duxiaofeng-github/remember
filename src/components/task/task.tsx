import React from "react";
import {View, StyleSheet} from "react-native";
import {Header} from "../common/header";
import {useTranslation} from "react-i18next";
import {colorTextLight, colorError} from "../../utils/style";
import {Tabs} from "../common/tabs";
import {ProcessingTask} from "./processing-task";
import {Route} from "../../utils/route";
import {useNavigation} from "@react-navigation/native";
import {AllTasks} from "./all-tasks";

interface IProps {}

export const Task: React.SFC<IProps> = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  return (
    <View style={s.container}>
      <Header
        title="Remember"
        hideBackButton
        createButton={{
          visible: true,
          onTouchEnd: () => {
            navigation.navigate(Route.EditTask);
          },
        }}
      />
      <Tabs
        tabs={[
          {title: t("Processing"), content: <ProcessingTask />},
          {title: t("Calendar"), content: null},
          {title: t("All tasks"), content: <AllTasks />},
        ]}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    overflow: "scroll",
  },
  subTitleContainer: {
    marginTop: 5,
    flexDirection: "row",
  },
  subTitleIcon: {
    marginTop: 3,
    marginRight: 5,
  },
  subTitle: {
    color: colorTextLight,
  },
  subTitleTimeout: {
    color: colorError,
  },
  deleteText: {
    color: colorError,
  },
});
