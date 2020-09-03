import React from "react";
import {View, StyleSheet} from "react-native";
import {useTranslation} from "react-i18next";
import {Text} from "./text";
import {colorPrimary, colorTextLight} from "../../utils/style";
import {Icon} from "./icon";

interface IProps {
  retry: () => void;
  tips?: string;
}

export const Retry: React.SFC<IProps> = (props) => {
  const {retry, tips} = props;
  const {t} = useTranslation();

  return (
    <View style={s.container}>
      <Icon name="alert-circle" size={40} color={colorTextLight} />
      <View style={s.tipsContainer}>
        <Text style={s.text}>{tips || t("Network error, please")}</Text>
        <View style={s.retry} onTouchEnd={retry}>
          <Text style={s.retryText}>{t("retry")}</Text>
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
  text: {color: colorTextLight},
  retry: {marginLeft: 5},
  retryText: {color: colorPrimary},
});
