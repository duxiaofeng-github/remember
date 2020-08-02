import React from "react";
import { View, StyleSheet } from "react-native";
import { Header } from "../common/header";
import { useNavigation } from "@react-navigation/native";
import { Route } from "../../utils/route";
import { Tabs } from "../common/tabs";
import I18n from "react-native-i18n";
import SortableList from "react-native-sortable-list";
import { Loading } from "../common/loading";
import { useData } from "../../utils/hooks/use-data";

interface IProps {}

export const Task: React.SFC<IProps> = () => {
  const navigation = useNavigation();
  const { setData, ...restOptions } = useData(async () => {});

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
      <Loading
        options={restOptions}
        render={(data) => {
          return (
            <Tabs
              tabs={[
                { title: I18n.t("daily"), content: <View>daily</View> },
                { title: I18n.t("weekly"), content: <View>weekly</View> },
                { title: I18n.t("monthly"), content: <View>monthly</View> },
                { title: I18n.t("others"), content: <View>others</View> },
              ]}
            />
          );
        }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
});
