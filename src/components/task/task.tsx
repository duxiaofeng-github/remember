import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Header } from "../common/header";
import { Loading } from "../common/loading";
import { ListItem } from "react-native-elements";
import { Text } from "../common/text";
import { Empty } from "../common/empty";
import { humanizeRangeTime, isTimeout, translate } from "../../utils/common";
import { colorTextLight, colorError } from "../../utils/style";
import { IStore } from "../../store";
import { useRexContext } from "../../store/store";
import { Icon } from "../common/icon";
import { listTasks, cancelTask, finishTask } from "../../db/task";
import flatten from "lodash/flatten";
import { PopupMenu } from "../common/popup-menu";
import { useSubmission } from "../../utils/hooks/use-submission";
import { Toast } from "../common/toast";

interface IProps {}

export const Task: React.SFC<IProps> = () => {
  const { tasksData } = useRexContext((store: IStore) => store);
  const { triggerer: cancelTaskTriggerer } = useSubmission(async (taskId?: string) => {
    await cancelTask(taskId!);

    Toast.message(translate("Cancel successfully"));

    await tasksData.load();
  });

  const { triggerer: finishTaskTriggerer } = useSubmission(async (taskId?: string) => {
    await finishTask(taskId!);

    await tasksData.load();
  });

  useEffect(() => {
    tasksData.load();
  }, []);

  return (
    <View style={s.container}>
      <Header title="Remember" hideBackButton />
      <Loading
        options={tasksData}
        render={() => {
          return tasksData.data!.length !== 0 ? (
            <View style={s.content}>
              {tasksData
                .data!.concat()
                .sort((a, b) => b.startedAt - a.startedAt)
                .map((item) => {
                  const { planId, content, startedAt, duration } = item;

                  return (
                    <ListItem
                      key={`${planId}-${startedAt}`}
                      bottomDivider
                      leftIcon={{
                        name: "square",
                        type: "feather",
                        size: 20,
                        onPress: () => {
                          finishTaskTriggerer(item._id);
                        },
                      }}
                      title={content}
                      subtitle={
                        <View style={s.subTitleContainer}>
                          <Icon style={s.subTitleIcon} name="clock" size={14} color={colorTextLight} />
                          <Text style={[s.subTitle, isTimeout(startedAt, duration) && s.subTitleTimeout]}>
                            {humanizeRangeTime(startedAt, duration)}
                          </Text>
                        </View>
                      }
                      onPress={async () => {
                        PopupMenu.show([
                          {
                            text: translate("Cancel task"),
                            onTouchStart: () => {
                              cancelTaskTriggerer(item._id);
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
