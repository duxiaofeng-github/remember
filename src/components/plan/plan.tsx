import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Header } from "../common/header";
import { useNavigation } from "@react-navigation/native";
import { Route } from "../../utils/route";
import { Loading } from "../common/loading";
import { ListItem } from "react-native-elements";
import { Text } from "../common/text";
import { Empty } from "../common/empty";
import {
  humanizeCron,
  isOneTimeSchedule,
  humanizeOneTimeSchedule,
  translate,
  secondsToDuration,
} from "../../utils/common";
import { colorTextLight, colorError } from "../../utils/style";
import { globalStore, IStore } from "../../store";
import { useRexContext } from "../../store/store";
import { Icon } from "../common/icon";
import { PopupMenu } from "../common/popup-menu";
import { useSubmission } from "../../utils/hooks/use-submission";
import { deletePlan } from "../../db/plan";
import { Toast } from "../common/toast";

interface IProps {}

export const Plan: React.SFC<IProps> = () => {
  const navigation = useNavigation();
  const { plansData, lang } = useRexContext((store: IStore) => store);

  useEffect(() => {
    plansData.load();
  }, []);

  const { triggerer: deletePlanTriggerer } = useSubmission(async (id?: string) => {
    await deletePlan(id!);

    Toast.message(translate("Delete successfully"));

    await plansData.load();
  });

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
          return data!.length !== 0 ? (
            <View style={s.content}>
              {data!
                .concat()
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((item) => {
                  const { schedule, duration } = item;

                  return (
                    <ListItem
                      key={item._id}
                      bottomDivider
                      title={item.content}
                      subtitle={
                        <View style={s.subTitleContainer}>
                          <Icon style={s.subTitleIcon} name="clock" size={14} color={colorTextLight} />
                          <Text style={s.subTitle}>
                            {isOneTimeSchedule(schedule)
                              ? humanizeOneTimeSchedule(schedule, duration)
                              : `${humanizeCron(schedule)}, ${translate("duration")}: ${secondsToDuration(duration)
                                  .locale(lang)
                                  .humanize(false)}`}
                          </Text>
                        </View>
                      }
                      rightIcon={{
                        type: "feather",
                        name: "more-vertical",
                        size: 20,
                        onPress: (e) => {
                          e.stopPropagation();

                          PopupMenu.show([
                            {
                              text: translate("Delete"),
                              style: s.deleteText,
                              onTouchStart: () => {
                                deletePlanTriggerer(item._id);
                              },
                            },
                          ]);
                        },
                      }}
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
  deleteText: {
    color: colorError,
  },
});
