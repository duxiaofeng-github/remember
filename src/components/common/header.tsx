import React from "react";
import {useNavigation} from "@react-navigation/native";
import {View, Text, StyleProp, TextStyle, StyleSheet} from "react-native";
import {Icon} from "./icon";
import {colorPrimary} from "../../utils/style";
import {useSafeAreaInsets} from "react-native-safe-area-context";

interface IProps {
  title: string;
  hideBackButton?: boolean;
  createButton?: {
    visible: boolean;
    text?: string;
    textStyle?: StyleProp<TextStyle>;
    onTouchEnd: () => void;
  };
}

export const Header: React.SFC<IProps> = (props) => {
  const {title, hideBackButton, createButton} = props;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  function renderRightComponent() {
    if (createButton) {
      const {visible, text, textStyle, onTouchEnd} = createButton;

      if (visible) {
        return text ? (
          <View onTouchStart={onTouchEnd}>
            <Text style={[s.text, textStyle]}>{text}</Text>
          </View>
        ) : (
          <Icon size={22} name="plus" color="#fff" onPress={onTouchEnd} />
        );
      }
    }
  }

  return (
    <View
      style={[s.container, {height: 50 + insets.top, paddingTop: insets.top}]}>
      {!hideBackButton && navigation.canGoBack() && (
        <View style={s.leftComponent}>
          <Icon
            size={22}
            name="chevron-left"
            color="#fff"
            onPress={() => navigation.goBack()}
          />
        </View>
      )}
      <Text style={s.title}>{title}</Text>
      {renderRightComponent()}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    backgroundColor: colorPrimary,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 15,
    paddingRight: 15,
  },
  leftComponent: {
    marginRight: 10,
  },
  text: {
    color: "#fff",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    flexGrow: 1,
    marginRight: 10,
  },
});
