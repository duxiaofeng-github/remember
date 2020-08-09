import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Header } from "../common/header";
import { useNavigation } from "@react-navigation/native";
import { Route } from "../../utils/route";
import { Loading } from "../common/loading";
import { ListItem } from "react-native-elements";
import { Text } from "../common/text";
import { Empty } from "../common/empty";
import { humanizeCron, isOneTimeSchedule, humanizeOneTimeSchedule } from "../../utils/common";
import { colorTextLight } from "../../utils/style";
import { globalStore, IStore } from "../../store";
import { useRexContext } from "../../store/store";
import { loadPlans } from "../../store/plan";

interface IProps {}

export const Plan: React.SFC<IProps> = () => {
  const navigation = useNavigation();
  const { plansData } = useRexContext((store: IStore) => store);

  useEffect(() => {
    plansData.load();
  }, []);

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
        options={plansData}
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
                const { schedule, duration } = item;
                return (
                  <ListItem
                    key={item._id}
                    bottomDivider
                    title={item.content}
                    subtitle={
                      <Text style={s.subTitle}>
                        {isOneTimeSchedule(schedule)
                          ? humanizeOneTimeSchedule(schedule, duration)
                          : humanizeCron(schedule)}
                      </Text>
                    }
                    onPress={async () => {
                      await globalStore.update((store) => {
                        store.edittingPlanId = item._id;
                      });

                      navigation.navigate(Route.EditPlan);
                    }}
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
  subTitle: {
    color: colorTextLight,
  },
});
