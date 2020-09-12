import React from "react";
import {StyleSheet, View} from "react-native";
import {colorTextLight} from "../../../utils/style";
import {Field} from "./field";
import {Icon} from "../icon";
import {Text} from "../text";

interface IProps {
  label: string;
  content?: string;
  onPress?: () => void;
}

export const DetailField: React.SFC<IProps> = (props) => {
  const {label, content, onPress} = props;

  return (
    <Field label={label}>
      <View style={s.content} onTouchEnd={onPress}>
        {content && <Text style={s.text}>{content}</Text>}
        <Icon size={14} color={colorTextLight} name="chevron-right" />
      </View>
    </Field>
  );
};

const s = StyleSheet.create({
  content: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 15,
    alignItems: "center",
    flexDirection: "row",
  },
  text: {
    paddingRight: 10,
  },
});
