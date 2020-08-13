import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Header } from "../common/header";
import { Loading } from "../common/loading";
import { ListItem } from "react-native-elements";
import { Text } from "../common/text";
import { Empty } from "../common/empty";
import { humanizeRangeTime, isTimeout } from "../../utils/common";
import { colorTextLight, colorError } from "../../utils/style";
import { IStore } from "../../store";
import { useRexContext } from "../../store/store";
import { Icon } from "../common/icon";
import { listTasks } from "../../db/plan";
import flatten from "lodash/flatten";

interface IProps {}

export const Task: React.SFC<IProps> = () => {
  const { plansData } = useRexContext((store: IStore) => store);
  const taskData = useMemo(() => {
    if (plansData && plansData.data) {
      const taskArray = plansData.data.map((plan) => {
        return listTasks({ plan, includeNoticeTime: true });
      });

      return flatten(taskArray);
    }

    return [];
  }, [plansData.data]);

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
                  const { planId, content, startedAt, duration } = item;

                  return (
                    <ListItem
                      key={`${planId}-${startedAt}`}
                      bottomDivider
                      title={content}
                      subtitle={
                        <View style={s.subTitleContainer}>
                          <Icon style={s.subTitleIcon} name="clock" size={14} color={colorTextLight} />
                          <Text style={[s.subTitle, isTimeout(startedAt, duration) && s.subTitleTimeout]}>
                            {humanizeRangeTime(startedAt, duration)}
                          </Text>
                        </View>
                      }
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
