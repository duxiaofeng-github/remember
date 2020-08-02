import React from "react";
import { View, StyleSheet } from "react-native";
import I18n from "react-native-i18n";
import { Text } from "./text";

interface IProps {
  retry: () => void;
  tips?: string;
}

export const Retry: React.SFC<IProps> = (props) => {
  const { retry, tips } = props;

  return (
    <View style={s.container}>
      <Text>{tips || I18n.t("Network error, please")}</Text>
      <View onTouchEnd={retry}>
        <Text>{I18n.t("retry")}</Text>
      </View>
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
