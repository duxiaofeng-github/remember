import React, {ReactNode} from "react";
import {StyleProp, StyleSheet, View, ViewStyle} from "react-native";
import {colorBorder, colorTextLight} from "../../utils/style";
import {Text} from "./text";

interface IProps {
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  bottomDivider?: boolean;
  title: ReactNode;
  subtitle: ReactNode;
  subtitleStyle?: StyleProp<ViewStyle>;
  onTouchStart?: () => void;
}

export const ListItem: React.SFC<IProps> = (props) => {
  const {
    leftComponent,
    rightComponent,
    title,
    subtitle,
    subtitleStyle,
    bottomDivider,
    onTouchStart,
  } = props;

  return (
    <View
      style={[s.container, bottomDivider && s.borderBottom]}
      onTouchStart={onTouchStart}>
      {leftComponent && <View style={s.leftContent}>{leftComponent}</View>}
      <View style={s.centerContent}>
        {typeof title === "string" ? (
          <Text style={s.title}>{title}</Text>
        ) : (
          title
        )}
        {subtitle != null && (
          <View style={[s.subtitleContainer, subtitleStyle]}>
            {typeof subtitle === "string" ? (
              <Text style={s.subtitle}>{subtitle}</Text>
            ) : (
              subtitle
            )}
          </View>
        )}
      </View>
      {rightComponent && <View style={s.rightContent}>{rightComponent}</View>}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  leftContent: {
    marginRight: 10,
  },
  rightContent: {
    marginLeft: 10,
  },
  centerContent: {
    flexGrow: 1,
  },
  borderBottom: {
    borderBottomColor: colorBorder,
    borderBottomWidth: 1,
  },
  subtitleContainer: {
    marginTop: 6,
    flexDirection: "row",
  },
  subtitle: {
    color: colorTextLight,
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
    flexWrap: "wrap",
  },
  titleContainer: {
    flexDirection: "row",
  },
  title: {
    fontSize: 16,
    lineHeight: 18,
  },
});
