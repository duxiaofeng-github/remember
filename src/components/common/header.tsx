import React from "react";
import {useNavigation} from "@react-navigation/native";
import {
  View,
  Text,
  StyleProp,
  TextStyle,
  StyleSheet,
  StatusBar,
} from "react-native";
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
        return (
          <View style={s.rightComponent} onTouchStart={onTouchEnd}>
            {text ? (
              <Text style={[s.text, textStyle]}>{text}</Text>
            ) : (
              <Icon size={22} name="plus" color="#fff" />
            )}
          </View>
        );
      }
    }
  }

  const backButton = !hideBackButton && navigation.canGoBack() && (
    <View style={s.leftComponent} onTouchStart={() => navigation.goBack()}>
      <Icon size={22} name="chevron-left" color="#fff" />
    </View>
  );

  return (
    <View
      style={[s.container, {height: 50 + insets.top, paddingTop: insets.top}]}>
      <StatusBar backgroundColor={colorPrimary} />
      {backButton}
      <Text style={[s.title, !backButton && s.titlePadding]}>{title}</Text>
      {renderRightComponent()}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    backgroundColor: colorPrimary,
    flexDirection: "row",
    alignItems: "center",
  },
  leftComponent: {
    padding: 15,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  rightComponent: {
    paddingRight: 15,
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 10,
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
  titlePadding: {
    marginLeft: 15,
  },
});
