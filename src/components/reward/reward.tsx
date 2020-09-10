import React from "react";
import {View, StyleSheet} from "react-native";
import {Header} from "../common/header";
import {useTranslation} from "react-i18next";
import {Tabs} from "../common/tabs";
import {AvailableRewards} from "./available-rewards";
import {Route} from "../../utils/route";
import {useNavigation} from "@react-navigation/native";
import {AllRewards} from "./all-rewards";
import {
  colorBackgroundGray,
  colorBorder,
  colorTextLight,
} from "../../utils/style";
import {Text} from "../common/text";
import {useRexContext} from "../../store/store";
import {IStore, globalStore} from "../../store";
import {EditRewardNavigationProp} from "./edit-reward";

interface IProps {}

export const Rewards: React.SFC<IProps> = () => {
  const navigation = useNavigation<EditRewardNavigationProp>();
  const {t} = useTranslation();
  const {settingsData} = useRexContext((store: IStore) => store);
  const {activedRewardTabIndex} = useRexContext((store: IStore) => store);

  return (
    <View style={s.container}>
      <Header
        title="Remember"
        hideBackButton
        createButton={{
          visible: true,
          onTouchEnd: () => {
            navigation.navigate(Route.EditReward, {});
          },
        }}
      />
      <Tabs
        tabs={[
          {title: t("Available rewards"), content: <AvailableRewards />},
          {title: t("All rewards"), content: <AllRewards />},
        ]}
        activedIndex={activedRewardTabIndex}
        onIndexChange={(index) => {
          globalStore.update((store) => {
            store.activedRewardTabIndex = index;
          });
        }}
      />
      <View style={s.bottomStatusBar}>
        <Text style={s.bottomStatusBarText}>
          {t("Available points n", {n: settingsData.data!.points})}
        </Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomStatusBar: {
    padding: 5,
    justifyContent: "center",
    backgroundColor: colorBackgroundGray,
    borderTopWidth: 1,
    borderTopColor: colorBorder,
  },
  bottomStatusBarText: {
    lineHeight: 14,
    color: colorTextLight,
    fontSize: 12,
  },
});
