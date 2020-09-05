import React from "react";
import {StyleProp, StyleSheet, View, ViewStyle} from "react-native";
import uniqolor from "uniqolor";

interface IProps {
  id: string;
  style?: StyleProp<ViewStyle>;
}

export const ColorMark: React.SFC<IProps> = (props) => {
  const {id, style} = props;
  return (
    <View
      style={[
        s.container,
        {backgroundColor: uniqolor(id, {format: "rgb"}).color},
        style,
      ]}></View>
  );
};

const s = StyleSheet.create({
  container: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
