import React from "react";
import { View, Text } from "react-native";
import { Header } from "../common/header";

interface IProps {}

export const Setting: React.SFC<IProps> = () => {
  return (
    <View>
      <Header hideBackButton title="Remember" />
      <Text>settings</Text>
    </View>
  );
};
