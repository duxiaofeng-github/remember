import React, {ReactNode} from "react";
import {View, StyleSheet, StyleProp, ViewStyle} from "react-native";
import {Text} from "../common/text";
import {colorBorder, colorPrimary} from "../../utils/style";

interface IProps {
  style?: StyleProp<ViewStyle>;
  tabs: {title: string; content: ReactNode}[];
  activedIndex: number;
  onIndexChange: (index: number) => void;
}

export const Tabs: React.SFC<IProps> = (props) => {
  const {style, tabs, activedIndex, onIndexChange} = props;

  return (
    <>
      <View style={[s.tabContainer, style]}>
        {tabs.map((item, index) => {
          return (
            <View
              key={item.title}
              style={[
                s.tab,
                activedIndex === index && s.tabSelected,
                {
                  width: `${100 / tabs.length}%`,
                },
              ]}
              onTouchEnd={() => {
                onIndexChange(index);
              }}>
              <View
                style={[
                  s.tabInner,
                  index === tabs.length - 1 && {
                    borderRightWidth: 0,
                  },
                ]}>
                <Text>{item.title}</Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={s.viewContainer}>{tabs[activedIndex].content}</View>
    </>
  );
};

const s = StyleSheet.create({
  tabContainer: {
    height: 40,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: colorBorder,
  },
  tab: {
    paddingTop: 6,
    paddingBottom: 6,
    marginBottom: -1,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabInner: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: colorBorder,
  },
  tabSelected: {
    borderBottomColor: colorPrimary,
  },
  viewContainer: {
    flex: 1,
    overflow: "hidden",
  },
});
