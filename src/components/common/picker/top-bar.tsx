import React from "react";
import {View, StyleSheet, Text, StyleProp, TextStyle} from "react-native";

interface ITopbarProps {
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  cancelText?: string;
  cancelStyle?: StyleProp<TextStyle>;
  onCancel?: () => void;
  confirmText?: string;
  confirmStyle?: StyleProp<TextStyle>;
  onConfirm?: () => void;
}

export const Topbar: React.SFC<ITopbarProps> = (props) => {
  const {
    title,
    titleStyle,
    cancelText = "Cancel",
    cancelStyle,
    confirmText = "Confirm",
    confirmStyle,
    onCancel,
    onConfirm,
  } = props;

  return (
    <View style={s.container}>
      {title && (
        <View style={[s.titleText, titleStyle]}>
          <Text>{title}</Text>
        </View>
      )}
      <View style={s.cancelContainer} onTouchEnd={onCancel}>
        <Text style={[s.cancelText, cancelStyle]}>{cancelText}</Text>
      </View>
      <View style={s.confirmContainer} onTouchEnd={onConfirm}>
        <Text style={[s.confirmText, confirmStyle]}>{confirmText}</Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    position: "relative",
    flexShrink: 0,
    height: 40,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ebedf0",
  },
  titleText: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: "#2b8bda",
  },
  confirmText: {
    color: "#2b8bda",
  },
  cancelContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
