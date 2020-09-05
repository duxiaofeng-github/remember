import React from "react";
import {View, StyleSheet} from "react-native";
import {useTranslation} from "react-i18next";
import {useNavigation} from "@react-navigation/native";
import {Route} from "../../utils/route";
import {Loading} from "../common/loading";
import {Text} from "../common/text";
import {Empty} from "../common/empty";
import {
  humanizeCron,
  isOneTimeSchedule,
  getRangeTime,
  secondsToDuration,
  formatTime,
} from "../../utils/common";
import {colorTextLight, colorError} from "../../utils/style";
import {globalStore, IStore} from "../../store";
import {useRexContext} from "../../store/store";
import {Icon} from "../common/icon";
import {PopupMenu} from "../common/popup-menu";
import {useSubmission} from "../../utils/hooks/use-submission";
import {Toast} from "../common/toast";
import {ListItem} from "../common/list-item";
import {deleteRewardPlan} from "../../db/reward";
import {Popup} from "../common/popup";

interface IProps {}

export const AllRewards: React.SFC<IProps> = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {rewardPlansData, settingsData} = useRexContext(
    (store: IStore) => store,
  );

  const {triggerer: deletePlanTriggerer} = useSubmission(
    async (id?: string) => {
      await deleteRewardPlan(id!);

      Toast.message(t("Delete successfully"));

      await rewardPlansData.load();
    },
  );

  return (
    <Loading
      options={rewardPlansData}
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
                          {duration !== 0
                            ? isOneTimeSchedule(schedule)
                              ? t("from to", getRangeTime(schedule, duration))
                              : `${humanizeCron(schedule)}, ${t(
                                  "validity",
                                )}: ${secondsToDuration(duration)
                                  .locale(settingsData.data!.lang)
                                  .humanize(false)}`
                            : isOneTimeSchedule(schedule)
                            ? formatTime(schedule)
                            : humanizeCron(schedule)}
                        </Text>
                      </>
                    }
                    onTouchStart={async () => {
                      PopupMenu.show([
                        {
                          text: t("Edit"),
                          onTouchStart: async () => {
                            await globalStore.update((store) => {
                              store.edittingRewardId = item._id;
                            });

                            navigation.navigate(Route.EditReward);
                          },
                        },
                        {
                          text: t("Delete"),
                          style: s.deleteText,
                          onTouchStart: () => {
                            Popup.confirm({
                              content: t("Confirm deleting"),
                              confirmTextStyle: s.deleteText,
                              onConfirm: () => {
                                deletePlanTriggerer(item._id);
                              },
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
  );
};

const s = StyleSheet.create({
  content: {
    flex: 1,
    overflow: "scroll",
  },
  subTitleContainer: {
    flexDirection: "row",
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
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorMark: {
    marginRight: 5,
  },
  title: {
    fontSize: 16,
    lineHeight: 16,
  },
  deleteText: {
    color: colorError,
  },
});
