import React, {useEffect, useMemo} from "react";
import {View, StyleSheet} from "react-native";
import {Loading} from "../common/loading";
import {Empty} from "../common/empty";
import {getRangeTime} from "../../utils/common";
import {globalStore, IStore} from "../../store";
import {useRexContext} from "../../store/store";
import {Icon} from "../common/icon";
import flatten from "lodash/flatten";
import {PopupMenu} from "../common/popup-menu";
import {useSubmission} from "../../utils/hooks/use-submission";
import {ListItem} from "../common/list-item";
import {useTranslation} from "react-i18next";
import {Route} from "../../utils/route";
import {useNavigation} from "@react-navigation/native";
import {listRewards, receiveReward} from "../../db/reward";
import {colorTextLight} from "../../utils/style";
import {Toast} from "../common/toast";
import {Popup} from "../common/popup";

interface IProps {}

export const AvailableRewards: React.SFC<IProps> = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {rewardPlansData, settingsData} = useRexContext(
    (store: IStore) => store,
  );
  const rewardsData = useMemo(() => {
    if (rewardPlansData && rewardPlansData.data) {
      const rewards = rewardPlansData.data.map((plan) => {
        return listRewards({plan});
      });

      return flatten(rewards);
    }

    return [];
  }, [rewardPlansData.data]);

  const {triggerer: receiveRewardTriggerer} = useSubmission(
    async (data?: {planId: string; rewardTime: number}) => {
      const {planId, rewardTime} = data!;

      await receiveReward(planId, rewardTime);

      await rewardPlansData.load();

      await settingsData.load();
    },
  );

  useEffect(() => {
    rewardPlansData.load();
  }, []);

  return (
    <Loading
      options={rewardPlansData}
      render={() => {
        return rewardsData!.length !== 0 ? (
          <View style={s.content}>
            {rewardsData!
              .concat()
              .sort((a, b) => b.startedAt - a.startedAt)
              .map((item) => {
                const {
                  planId,
                  content,
                  startedAt,
                  duration,
                  consumption,
                } = item;

                return (
                  <ListItem
                    key={`${planId}-${startedAt}`}
                    bottomDivider
                    rightComponent={
                      <View
                        onTouchStart={(e) => {
                          e.stopPropagation();

                          if (settingsData.data!.points < consumption) {
                            Toast.message(t("Points is not enough"));
                          } else {
                            Popup.confirm({
                              content: t("Confirm receiving reward"),
                              onConfirm: () => {
                                receiveRewardTriggerer({
                                  planId,
                                  rewardTime: startedAt,
                                });
                              },
                            });
                          }
                        }}>
                        <Icon name="square" size={20} color={colorTextLight} />
                      </View>
                    }
                    title={content}
                    subtitle={`${
                      duration !== 0
                        ? t(
                            "Validity from to",
                            getRangeTime(startedAt, duration),
                          )
                        : ""
                    }${duration !== 0 && consumption ? ", " : ""}${
                      consumption
                        ? t("Points Required n", {n: consumption})
                        : ""
                    }`}
                    onTouchStart={async () => {
                      PopupMenu.show([
                        {
                          text: t("Edit reward"),
                          onTouchStart: async () => {
                            await globalStore.update((store) => {
                              store.edittingRewardId = item.planId;
                            });

                            navigation.navigate(Route.EditReward);
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
});