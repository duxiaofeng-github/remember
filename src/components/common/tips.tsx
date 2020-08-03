import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "./text";

interface IProps {}

export const Tips: React.SFC<IProps> = (props) => {
  const { children } = props;

  return (
    <View style={s.container}>
      <Text>{children}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
