import React from "react";
import { View, Text } from "react-native";
import { Header } from "../common/header";

interface IProps {}

export const EditPlan: React.SFC<IProps> = () => {
  return (
    <View>
      <Header title="Remember" />
      <Text>edit plan</Text>
    </View>
  );
};
