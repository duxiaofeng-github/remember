import React from "react";
import {View, StyleSheet} from "react-native";
import {Header} from "../common/header";
import {translate} from "../../utils/common";
import {colorTextLight, colorError} from "../../utils/style";
import {Tabs} from "../common/tabs";
import {ProcessingTask} from "./processing-task";
import {Route} from "../../utils/route";
import {useNavigation} from "@react-navigation/native";

interface IProps {}

export const Task: React.SFC<IProps> = () => {
  const navigation = useNavigation();

  return (
    <View style={s.container}>
      <Header
        title="Remember"
        hideBackButton
        createButton={{
          visible: true,
          onTouchEnd: () => {
            navigation.navigate(Route.EditPlan);
          },
        }}
      />
      <Tabs
        tabs={[
          {title: translate("Processing"), content: <ProcessingTask />},
          {title: translate("Calendar"), content: null},
          {title: translate("All tasks"), content: <ProcessingTask />},
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
