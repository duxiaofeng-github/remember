import React from "react";
import {StyleSheet, ScrollView} from "react-native";
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
} from "../../utils/common";
import {colorTextLight, colorError} from "../../utils/style";
import {IStore} from "../../store";
import {useRexContext} from "../../store/store";
import {PopupMenu} from "../common/popup-menu";
import {useSubmission} from "../../utils/hooks/use-submission";
import {deletePlan} from "../../db/plan";
import {Toast} from "../common/toast";
import {ListItem} from "../common/list-item";
import {ColorMark} from "../common/color-mark";
import {Popup} from "../common/popup";
import {EditTaskNavigationProp} from "./edit-task";

interface IProps {}

export const AllTasks: React.SFC<IProps> = () => {
  const navigation = useNavigation<EditTaskNavigationProp>();
  const {t} = useTranslation();
  const {plansData, settingsData} = useRexContext((store: IStore) => store);

  const {triggerer: deletePlanTriggerer} = useSubmission(
    async (id?: string) => {
      await deletePlan(id!);

      Toast.message(t("Delete successfully"));

      await plansData.load();
    },
  );

  return (
    <Loading
      options={plansData}
      render={(data) => {
        return data!.length !== 0 ? (
          <ScrollView style={s.content}>
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
                        <ColorMark style={s.colorMark} id={item._id} />
                        <Text style={s.subTitle}>
                          {isOneTimeSchedule(schedule)
                            ? t("from to", getRangeTime(schedule, duration))
                            : `${humanizeCron(schedule)}, ${t(
                                "Duration",
                              )}: ${secondsToDuration(duration)
                                .locale(settingsData.data!.lang)
                                .humanize(false)}`}
                        </Text>
                      </>
                    }
                    onPress={async () => {
                      PopupMenu.show([
                        {
                          text: t("Edit"),
                          onPress: async () => {
                            navigation.navigate(Route.EditTask, {
                              planId: item._id,
                            });
                          },
                        },
                        {
                          text: t("Delete"),
                          style: s.deleteText,
                          onPress: () => {
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
    marginTop: 1,
    marginRight: 5,
  },
  title: {
    fontSize: 16,
    lineHeight: 18,
  },
  deleteText: {
    color: colorError,
  },
});
