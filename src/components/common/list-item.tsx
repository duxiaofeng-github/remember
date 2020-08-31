import React, {ReactNode} from "react";
import {StyleSheet, View} from "react-native";
import {colorBorder, colorTextLight} from "../../utils/style";
import {Text} from "./text";

interface IProps {
  leftComponent?: ReactNode;
  bottomDivider?: boolean;
  title: ReactNode;
  subtitle: ReactNode;
  onTouchStart?: () => void;
}

export const ListItem: React.SFC<IProps> = (props) => {
  const {leftComponent, title, subtitle, bottomDivider, onTouchStart} = props;

  return (
    <View
      style={[s.container, bottomDivider && s.borderBottom]}
      onTouchStart={onTouchStart}>
      {leftComponent && <View style={s.leftContent}>{leftComponent}</View>}
      <View style={s.centerContent}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  leftContent: {
    flexShrink: 0,
    marginRight: 10,
  },
  centerContent: {
    flexDirection: "column",
    flexGrow: 1,
  },
  borderBottom: {
    borderBottomColor: colorBorder,
    borderBottomWidth: 1,
  },
  subtitle: {
    color: colorTextLight,
  },
  title: {
    fontSize: 18,
  },
});
