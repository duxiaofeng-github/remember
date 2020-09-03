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
import {ColorMark} from "../common/color-mark";

interface IProps {}

export const AllTasks: React.SFC<IProps> = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {plansData, lang} = useRexContext((store: IStore) => store);

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
                    title={
                      <View style={s.titleContainer}>
                        <ColorMark style={s.colorMark} id={item._id} />
                        <Text style={s.title}>{item.content}</Text>
                      </View>
                    }
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
                            ? t(
                                "{{from}} to {{to}}",
                                getRangeTime(schedule, duration),
                              )
                            : `${humanizeCron(schedule)}, ${t(
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
                          text: t("Edit"),
                          onTouchStart: async () => {
                            await globalStore.update((store) => {
                              store.edittingPlanId = item._id;
                            });

                            navigation.navigate(Route.EditTask);
                          },
                        },
                        {
                          text: t("Delete"),
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
    fontWeight: "bold",
  },
  deleteText: {
    color: colorError,
  },
});
