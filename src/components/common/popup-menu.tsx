import React from "react";
import {Popup} from "./popup";
import {StyleProp, TextStyle, View, StyleSheet} from "react-native";
import {Text} from "./text";
import {colorBorder} from "../../utils/style";

export const PopupMenu = {
  show: async (
    items: {
      text: string;
      style?: StyleProp<TextStyle>;
      onPress?: () => void;
    }[],
  ) => {
    const close = await Popup.show({
      contentStyle: s.container,
      children: items.map((item, index) => {
        return (
          <View
            key={item.text}
            style={[s.item, index !== items.length - 1 && s.itemBorder]}
            onTouchEnd={async () => {
              await close();

              if (item.onPress) {
                item.onPress();
              }
            }}>
            <Text style={[s.text, item.style]}>{item.text}</Text>
          </View>
        );
      }),
    });

    return close;
  },
};

const s = StyleSheet.create({
  container: {
    width: "85%",
  },
  item: {
    padding: 15,
  },
  itemBorder: {
    borderBottomColor: colorBorder,
    borderBottomWidth: 1,
  },
  text: {
    flexWrap: "nowrap",
    fontSize: 16,
  },
});
