import React from "react";
import {View, StyleSheet} from "react-native";
import {Header} from "../common/header";
import {useNavigation} from "@react-navigation/native";
import {Route} from "../../utils/route";
import {Loading} from "../common/loading";
import {Text} from "../common/text";
import {Empty} from "../common/empty";
import {
  humanizeCron,
  isOneTimeSchedule,
  humanizeRangeTime,
  translate,
  secondsToDuration,
} from "../../utils/common";
import {colorTextLight, colorError} from "../../utils/style";
import {globalStore, IStore} from "../../store";
import {useRexContext} from "../../store/store";
import {Icon} from "../common/icon";
import {PopupMenu} from "../common/popup-menu";
import {useSubmission} from "../../utils/hooks/use-submission";
import {deletePlan} from "../../db/plan";
import {Toast} from "../common/toast";
import {ListItem} from "../common/list-item";

interface IProps {}

export const AllTasks: React.SFC<IProps> = () => {
  const navigation = useNavigation();
  const {plansData, lang} = useRexContext((store: IStore) => store);

  const {triggerer: deletePlanTriggerer} = useSubmission(
    async (id?: string) => {
      await deletePlan(id!);

      Toast.message(translate("Delete successfully"));

      await plansData.load();
    },
  );

  return (
    <Loading
      options={plansData}
      render={(data) => {
        return data!.length !== 0 ? (
          <View style={s.content}>
            {data!
              .concat()
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((item) => {
                const {schedule, duration} = item;

                return (
                  <ListItem
                    key={item._id}
                    bottomDivider
                    title={item.content}
                    subtitleStyle={s.subTitleContainer}
                    subtitle={
                      <>
                        <Icon
                          style={s.subTitleIcon}
                          name="clock"
                          size={12}
                          color={colorTextLight}
                        />
                        <Text style={s.subTitle}>
                          {isOneTimeSchedule(schedule)
                            ? humanizeRangeTime(schedule, duration)
                            : `${humanizeCron(schedule)}, ${translate(
                                "duration",
                              )}: ${secondsToDuration(duration)
                                .locale(lang)
                                .humanize(false)}`}
                        </Text>
                      </>
                    }
                    onTouchStart={async () => {
                      PopupMenu.show([
                        {
                          text: translate("Edit"),
                          onTouchStart: async () => {
                            await globalStore.update((store) => {
                              store.edittingPlanId = item._id;
                            });

                            navigation.navigate(Route.EditPlan);
                          },
                        },
                        {
                          text: translate("Delete"),
                          style: s.deleteText,
                          onTouchStart: () => {
                            deletePlanTriggerer(item._id);
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
    flexDirection: "row",
  },
  subTitleIcon: {
    marginTop: 1,
    marginRight: 5,
  },
  subTitle: {
    color: colorTextLight,
    flex: 1,
    flexWrap: "wrap",
    fontSize: 12,
    lineHeight: 14,
  },
  deleteText: {
    color: colorError,
  },
});
