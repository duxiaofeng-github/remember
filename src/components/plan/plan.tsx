import React from "react";
import { View, StyleSheet } from "react-native";
import { Header } from "../common/header";
import { useNavigation } from "@react-navigation/native";
import { Route } from "../../utils/route";
import { Loading } from "../common/loading";
import { useData } from "../../utils/hooks/use-data";
import { listPlans } from "../../db/plan";
import { ListItem } from "react-native-elements";
import { Text } from "../common/text";
import { Empty } from "../common/empty";
import { humanizeCron, humanizeDuration, translate } from "../../utils/common";

interface IProps {}

export const Plan: React.SFC<IProps> = () => {
  const navigation = useNavigation();
  const { setData, ...restOptions } = useData(listPlans);

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
      <Loading
        options={restOptions}
        render={(data) => {
          // return (
          //   <Tabs
          //     tabs={[
          //       { title: I18n.t("daily"), content: <View>daily</View> },
          //       { title: I18n.t("weekly"), content: <View>weekly</View> },
          //       { title: I18n.t("monthly"), content: <View>monthly</View> },
          //       { title: I18n.t("others"), content: <View>others</View> },
          //     ]}
          //   />
          // );

          return data!.length !== 0 ? (
            <View>
              {data!.map((item) => {
                return (
                  <ListItem
                    key={item._id}
                    title={item.content}
                    subtitle={
                      <Text>
                        {humanizeCron(item.schedule)}
                        {item.duration ? `, ${translate("duration")}: ${humanizeDuration(item.duration)}` : ""}
                        {item.repeat ? `, ${translate("repeat")}: ${item.repeat}${translate("times")}` : ""}
                      </Text>
                    }
                    bottomDivider
                  />
                );
              })}
            </View>
          ) : (
            <Empty />
          );
        }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
});
