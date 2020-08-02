import React from "react";
import { View, Text } from "react-native";
import { Header } from "../common/header";

interface IProps {}

export const EditTask: React.SFC<IProps> = () => {
  return (
    <View>
      <Header title="Remember" />
      <Text>edit task</Text>
    </View>
  );
};
