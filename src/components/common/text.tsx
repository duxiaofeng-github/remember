import React from "react";
import {Text as RNText, TextProps, StyleSheet} from "react-native";
import {colorText} from "../../utils/style";

export const Text: React.SFC<TextProps> = (props) => {
  const {style, ...restProps} = props;

  return <RNText style={[s.text, style]} {...restProps} />;
};

const s = StyleSheet.create({
  text: {
    color: colorText,
  },
});
