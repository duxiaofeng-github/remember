import React from "react";
import { Popup } from "./popup";
import { StyleProp, TextStyle, View, StyleSheet } from "react-native";
import { Text } from "./text";

export const PopupMenu = {
  show: async (items: { text: string; style: StyleProp<TextStyle>; onTouchStart?: () => void }[]) => {
    const close = await Popup.show({
      contentStyle: s.container,
      children: items.map((item) => {
        return (
          <View
            style={s.item}
            onTouchStart={() => {
              if (item.onTouchStart) {
                item.onTouchStart();
              }

              close();
            }}
          >
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
  text: {
    flexWrap: "nowrap",
    fontSize: 18,
  },
});
