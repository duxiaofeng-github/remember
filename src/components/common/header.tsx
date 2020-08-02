import React from "react";
import { Header as RNEHeader } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";

interface IProps {
  title: string;
  hideBackButton?: boolean;
  createButton?: {
    visible: boolean;
    onTouchEnd: () => void;
  };
}

export const Header: React.SFC<IProps> = (props) => {
  const { title, hideBackButton, createButton } = props;
  const navigation = useNavigation();

  return (
    <RNEHeader
      placement="left"
      leftComponent={
        !hideBackButton && navigation.canGoBack()
          ? { type: "feather", icon: "chevron-left", color: "#fff", onPress: () => navigation.goBack() }
          : undefined
      }
      centerComponent={{ text: title, style: { color: "#fff", fontSize: 18 } }}
      rightComponent={
        createButton && createButton.visible
          ? { type: "feather", icon: "plus", color: "#fff", onPress: () => createButton.onTouchEnd() }
          : undefined
      }
    />
  );
};
