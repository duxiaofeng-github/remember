import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "./text";
import { translate } from "../../utils/common";
import { colorPrimary } from "../../utils/style";

interface IProps {
  retry: () => void;
  tips?: string;
}

export const Retry: React.SFC<IProps> = (props) => {
  const { retry, tips } = props;

  return (
    <View style={s.container}>
      <Text>{tips || translate("Network error, please")}</Text>
      <View style={s.retry} onTouchEnd={retry}>
        <Text style={s.retryText}>{translate("retry")}</Text>
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
  retry: { marginLeft: 5 },
  retryText: { color: colorPrimary },
});
