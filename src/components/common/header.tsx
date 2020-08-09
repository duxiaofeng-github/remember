import React from "react";
import { Header as RNEHeader } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import { View, Text, StyleProp, TextStyle, StyleSheet } from "react-native";

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
  const { title, hideBackButton, createButton } = props;
  const navigation = useNavigation();

  function renderRightComponent() {
    if (createButton) {
      const { visible, text, textStyle, onTouchEnd } = createButton;

      if (visible) {
        return text ? (
          <View onTouchStart={onTouchEnd}>
            <Text style={[s.text, textStyle]}>{text}</Text>
          </View>
        ) : (
          { type: "feather", icon: "plus", color: "#fff", onPress: onTouchEnd }
        );
      }
    }
  }

  return (
    <RNEHeader
      placement="left"
      leftComponent={
        !hideBackButton && navigation.canGoBack()
          ? { type: "feather", icon: "chevron-left", color: "#fff", onPress: () => navigation.goBack() }
          : undefined
      }
      centerComponent={{ text: title, style: { color: "#fff", fontSize: 18 } }}
      rightComponent={renderRightComponent()}
    />
  );
};

const s = StyleSheet.create({
  text: {
    color: "#fff",
  },
});
