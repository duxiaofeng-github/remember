import React from "react";
import { View, StyleSheet, Text, StyleProp, ViewStyle, TextStyle } from "react-native";
import { Icon } from "react-native-elements";

interface IProps {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  text: string;
  dropDownIconColor?: string;
  onTouchStart: () => void;
}

export const Input: React.SFC<IProps> = (props) => {
  const { style, text, textStyle, dropDownIconColor, onTouchStart } = props;

  return (
    <View style={[s.pickerPlaceHolder, style]} onTouchStart={onTouchStart}>
      <Text style={textStyle}>{text}</Text>
      <Icon type="feather" name="chevron-down" size={20} color={dropDownIconColor} />
    </View>
  );
};

const s = StyleSheet.create({
  pickerPlaceHolder: {
    height: 22,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#606770",
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#606770",
  },
});
