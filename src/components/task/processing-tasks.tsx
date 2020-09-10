import React, {useEffect, useMemo, useState} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  AppStateStatus,
  AppState,
} from "react-native";
import {Loading} from "../common/loading";
import {Text} from "../common/text";
import {Empty} from "../common/empty";
import {getRangeTime, humanizeCount, isTimeout} from "../../utils/common";
import {colorTextLight, colorError} from "../../utils/style";
import {IStore} from "../../store";
import {useRexContext} from "../../store/store";
import {Icon} from "../common/icon";
import {listTasks, cancelTask, finishTask} from "../../db/plan";
import flatten from "lodash/flatten";
import {PopupMenu} from "../common/popup-menu";
import {useSubmission} from "../../utils/hooks/use-submission";
import {Toast} from "../common/toast";
import {ListItem} from "../common/list-item";
import {useTranslation} from "react-i18next";
import {Route} from "../../utils/route";
import {useNavigation} from "@react-navigation/native";
import {ColorMark} from "../common/color-mark";
import {EditTaskNavigationProp} from "./edit-task";

interface IProps {}

export const ProcessingTasks: React.SFC<IProps> = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<EditTaskNavigationProp>();
  const {plansData, settingsData} = useRexContext((store: IStore) => store);
  const taskData = useMemo(() => {
    if (plansData && plansData.data) {
      const taskArray = plansData.data.map((plan) => {
        return listTasks({plan, includeNoticeTime: true});
      });

      return flatten(taskArray);
    }

    return [];
  }, [plansData.data]);

  const {triggerer: cancelTaskTriggerer} = useSubmission(
    async (data?: {planId: string; taskTime: number}) => {
      const {planId, taskTime} = data!;

      await cancelTask(planId, taskTime);

      Toast.message(t("Cancel successfully"));

      await plansData.load();
    },
  );

  const {triggerer: finishTaskTriggerer} = useSubmission(
    async (data?: {planId: string; taskTime: number}) => {
      const {planId, taskTime} = data!;

      await finishTask(planId, taskTime);

      await plansData.load();

      await settingsData.load();
    },
  );

  useEffect(() => {
    plansData.load();
  }, []);

  useEffect(() => {
    let appState = "active";

    function handleStateChange(nextAppState: AppStateStatus) {
      if (appState === "background" && nextAppState === "active") {
        plansData.load();
      }

      appState = nextAppState;
    }

    AppState.addEventListener("change", handleStateChange);

    return () => {
      AppState.removeEventListener("change", handleStateChange);
    };
  }, []);

  return (
    <Loading
      options={plansData}
      render={() => {
        return taskData!.length !== 0 ? (
          <ScrollView style={s.content}>
            {taskData!
              .concat()
              .sort((a, b) => b.startedAt - a.startedAt)
              .map((item) => {
                const {planId, content, startedAt, duration, plan} = item;
                const {count, finishedTime} = plan;

                return (
                  <ListItem
                    key={`${planId}-${startedAt}`}
                    bottomDivider
                    rightComponent={
                      <View
                        onTouchEnd={(e) => {
                          e.stopPropagation();

                          finishTaskTriggerer({
                            planId,
                            taskTime: startedAt,
                          });
                        }}>
                        <Icon name="square" size={20} color={colorTextLight} />
                      </View>
                    }
                    title={content}
                    subtitle={
                      <>
                        <ColorMark style={s.colorMark} id={planId} />
                        <Text
                          style={[
                            s.subTitle,
                            isTimeout(startedAt, duration) && s.subTitleTimeout,
                          ]}>
                          {count !== 1 &&
                            `${humanizeCount({
                              count,
                              time: startedAt,
                              finishedTime,
                            })} `}
                          {t("from to", getRangeTime(startedAt, duration))}
                        </Text>
                      </>
                    }
                    onPress={async () => {
                      PopupMenu.show([
                        {
                          text: t("Edit task"),
                          onPress: async () => {
                            navigation.navigate(Route.EditTask, {
                              planId: item.planId,
                            });
                          },
                        },
                        {
                          text: t("Cancel task"),
                          style: s.cancelText,
                          onPress: () => {
                            cancelTaskTriggerer({
                              planId: item.planId,
                              taskTime: item.startedAt,
                            });
                          },
                        },
                      ]);
                    }}
                  />
                );
              })}
          </ScrollView>
        ) : (
          <Empty />
        );
      }}
    />
  );
};

const s = StyleSheet.create({
  content: {
    flex: 1,
  },
  subTitleIcon: {
    marginRight: 5,
  },
  subTitle: {
    color: colorTextLight,
    flex: 1,
    flexWrap: "wrap",
    fontSize: 12,
    lineHeight: 14,
  },
  subTitleTimeout: {
    color: colorError,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorMark: {
    marginTop: 1,
    marginRight: 5,
  },
  title: {
    fontSize: 16,
    lineHeight: 18,
  },
  cancelText: {
    color: colorError,
  },
});
