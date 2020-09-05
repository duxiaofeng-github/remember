import React, {ReactNode} from "react";
import {
  View,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import {colorTextLight} from "../../../utils/style";
import {Icon} from "../icon";

interface IProps {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  text: string;
  dropDownIcon?: ReactNode;
  dropDownIconColor?: string;
  showClearIcon?: boolean;
  onIconTouchStart?: () => void;
  onTouchStart: () => void;
}

export const Input: React.SFC<IProps> = (props) => {
  const {
    style,
    text,
    textStyle,
    showClearIcon,
    dropDownIcon,
    dropDownIconColor = colorTextLight,
    onTouchStart,
    onIconTouchStart,
  } = props;

  return (
    <View style={[s.pickerPlaceHolder, style]} onTouchStart={onTouchStart}>
      <Text style={textStyle}>{text}</Text>
      {dropDownIcon ? (
        dropDownIcon
      ) : (
        <View
          onTouchStart={(e) => {
            e.stopPropagation();

            if (onIconTouchStart) {
              onIconTouchStart();
            }
          }}>
          <Icon
            style={s.icon}
            name={showClearIcon ? "x" : "code"}
            size={14}
            color={dropDownIconColor}
          />
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  pickerPlaceHolder: {
    height: 22,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#606770",
    fontSize: 16,
  },
  icon: {
    marginLeft: 3,
    transform: [{rotate: "90deg"}],
  },
});
