import React, {useState, ReactNode} from "react";
import {View, StyleSheet, StyleProp, ViewStyle} from "react-native";
import {Text} from "../common/text";
import {colorBorder, colorPrimary} from "../../utils/style";

interface IProps {
  style?: StyleProp<ViewStyle>;
  tabs: {title: string; content: ReactNode}[];
}

export const Tabs: React.SFC<IProps> = (props) => {
  const {style, tabs} = props;
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <>
      <View style={[s.tabContainer, style]}>
        {tabs.map((item, index) => {
          return (
            <View
              key={item.title}
              style={[
                s.tab,
                tabIndex === index && s.tabSelected,
                {
                  width: `${100 / tabs.length}%`,
                },
              ]}
              onTouchEnd={() => {
                setTabIndex(index);
              }}>
              <Text
                style={[
                  s.tabText,
                  index === tabs.length - 1 && {
                    borderRightWidth: 0,
                  },
                ]}>
                {item.title}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={s.viewContainer}>{tabs[tabIndex].content}</View>
    </>
  );
};

const s = StyleSheet.create({
  tabContainer: {
    height: 40,
    flexShrink: 0,
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
  tabText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: colorBorder,
  },
  tabSelected: {
    borderBottomColor: colorPrimary,
  },
  viewContainer: {flex: 1},
});
