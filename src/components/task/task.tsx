import React, {useEffect, useMemo} from "react";
import {View, StyleSheet} from "react-native";
import {Header} from "../common/header";
import {Loading} from "../common/loading";
import {Text} from "../common/text";
import {Empty} from "../common/empty";
import {humanizeRangeTime, isTimeout, translate} from "../../utils/common";
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

interface IProps {}

export const Task: React.SFC<IProps> = () => {
  const {plansData} = useRexContext((store: IStore) => store);
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

      Toast.message(translate("Cancel successfully"));

      await plansData.load();
    },
  );

  const {triggerer: finishTaskTriggerer} = useSubmission(
    async (data?: {planId: string; taskTime: number}) => {
      const {planId, taskTime} = data!;

      await finishTask(planId, taskTime);

      await plansData.load();
    },
  );

  useEffect(() => {
    plansData.load();
  }, []);

  return (
    <View style={s.container}>
      <Header title="Remember" hideBackButton />
      <Loading
        options={plansData}
        render={() => {
          return taskData!.length !== 0 ? (
            <View style={s.content}>
              {taskData!
                .concat()
                .sort((a, b) => b.startedAt - a.startedAt)
                .map((item) => {
                  const {planId, content, startedAt, duration} = item;

                  return (
                    <ListItem
                      key={`${planId}-${startedAt}`}
                      bottomDivider
                      leftComponent={
                        <Icon
                          name="square"
                          size={20}
                          onPress={(e) => {
                            e.stopPropagation();

                            finishTaskTriggerer({
                              planId: item.planId,
                              taskTime: item.startedAt,
                            });
                          }}
                        />
                      }
                      title={content}
                      subtitle={
                        <View style={s.subTitleContainer}>
                          <Icon
                            style={s.subTitleIcon}
                            name="clock"
                            size={14}
                            color={colorTextLight}
                          />
                          <Text
                            style={[
                              s.subTitle,
                              isTimeout(startedAt, duration) &&
                                s.subTitleTimeout,
                            ]}>
                            {humanizeRangeTime(startedAt, duration)}
                          </Text>
                        </View>
                      }
                      onTouchStart={async () => {
                        PopupMenu.show([
                          {
                            text: translate("Cancel task"),
                            onTouchStart: () => {
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
  subTitleTimeout: {
    color: colorError,
  },
  deleteText: {
    color: colorError,
  },
});
