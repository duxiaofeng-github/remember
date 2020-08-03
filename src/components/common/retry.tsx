import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "./text";
import { translate } from "../../utils/common";
import { colorPrimary, colorTextLight } from "../../utils/style";
import { Icon } from "react-native-elements";

interface IProps {
  retry: () => void;
  tips?: string;
}

export const Retry: React.SFC<IProps> = (props) => {
  const { retry, tips } = props;

  return (
    <View style={s.container}>
      <Icon type="feather" name="alert-circle" size={40} color={colorTextLight} />
      <View style={s.tipsContainer}>
        <Text style={s.text}>{tips || translate("Network error, please")}</Text>
        <View style={s.retry} onTouchEnd={retry}>
          <Text style={s.retryText}>{translate("retry")}</Text>
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tipsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  text: { color: colorTextLight },
  retry: { marginLeft: 5 },
  retryText: { color: colorPrimary },
});
