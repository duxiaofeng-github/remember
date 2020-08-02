import React from "react";
import { View, Text } from "react-native";
import { Header } from "../common/header";
import { Route } from "../../utils/route";
import { useNavigation } from "@react-navigation/native";

interface IProps {}

export const Reward: React.SFC<IProps> = () => {
  const navigation = useNavigation();

  return (
    <View>
      <Header
        title="Remember"
        hideBackButton
        createButton={{
          visible: true,
          onTouchEnd: () => {
            navigation.navigate(Route.EditReward);
          },
        }}
      />
      <Text>reward</Text>
    </View>
  );
};
