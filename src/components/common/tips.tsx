import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "./text";
import { Icon } from "react-native-elements";
import { colorTextLight } from "../../utils/style";

interface IProps {
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
}

export const Tips: React.SFC<IProps> = (props) => {
  const { iconName, iconSize = 40, iconColor = colorTextLight, children } = props;

  return (
    <View style={s.container}>
      {iconName && <Icon type="feather" name={iconName} size={iconSize} color={iconColor} />}
      <Text style={s.text}>{children}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginTop: 10,
    color: colorTextLight,
  },
});
