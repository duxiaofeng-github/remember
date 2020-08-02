import React from "react";
import { View, Text } from "react-native";
import { Header } from "../common/header";

interface IProps {}

export const EditReward: React.SFC<IProps> = () => {
  return (
    <View>
      <Header title="Remember" />
      <Text>edit reward</Text>
    </View>
  );
};
