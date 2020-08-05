import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Animated,
  GestureResponderEvent,
  Easing,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

type IData<T> = { key?: string; label: string; value: T };

interface IProps<T> {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  selectedIndex?: number;
  data: IData<T>[];
  onChange: (index: number, record: IData<T>) => void;
}

const itemHeight = 30;
const itemCount = 5;
const indicatorUpperBounce = ((itemCount - 1) / 2) * itemHeight;

let originY = 0;
let originTop = 0;
let prevTop = 0;
let distance = 0;

function getTopByIndex(index: number) {
  return indicatorUpperBounce - index * itemHeight;
}

export const ScrollView: <T>(p: IProps<T>) => React.ReactElement<IProps<T>> | null = (props) => {
  const { data, selectedIndex = 0, textStyle, style, onChange } = props;
  const innerHeight = data.length * itemHeight;
  const [containerHeight, setContainerHeight] = useState(0);
  const initialTop = getTopByIndex(selectedIndex);
  const topValue = useRef(new Animated.Value(initialTop)).current;
  prevTop = initialTop;

  useEffect(() => {
    Animated.timing(topValue, {
      toValue: getTopByIndex(selectedIndex),
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [selectedIndex]);

  function touchStart(e: GestureResponderEvent) {
    const touch = e.nativeEvent.touches[0];
    originY = touch.pageY;
    originTop = prevTop;
  }
  function touchMove(e: GestureResponderEvent) {
    const touch = e.nativeEvent.touches[0];

    distance = touch.pageY - originY;

    let top = originTop + distance;
    const bottom = containerHeight - (innerHeight + top);

    if (top > indicatorUpperBounce + 1) {
      top = 10 / top + prevTop;
    } else if (bottom > indicatorUpperBounce + 1) {
      top = prevTop - 10 / bottom;
    }

    prevTop = top;

    Animated.timing(topValue, {
      toValue: top,
      duration: 0,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }
  function touchEnd() {
    const top = originTop + distance;
    const bottom = containerHeight - (innerHeight + top);
    let toTop = 0;

    if (top > indicatorUpperBounce) {
      toTop = indicatorUpperBounce;
      onSelect(0);
    } else if (bottom > indicatorUpperBounce) {
      toTop = -(innerHeight - containerHeight) - indicatorUpperBounce;
      onSelect(data.length - 1);
    } else {
      const offsetTop = -(top - indicatorUpperBounce);
      const offsetItemIndex = Math.round(offsetTop / itemHeight);
      toTop = -(offsetItemIndex * itemHeight) + indicatorUpperBounce;
      onSelect(offsetItemIndex);
    }

    prevTop = toTop;

    Animated.timing(topValue, {
      toValue: toTop,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }
  function onSelect(index: number) {
    onChange(index, data[index]);
  }

  return (
    <View
      style={[s.container, style]}
      onLayout={(e) => {
        const { height } = e.nativeEvent.layout;

        setContainerHeight(height);
      }}
    >
      <Animated.View
        style={[s.inner, { transform: [{ translateY: topValue }] }]}
        onTouchStart={touchStart}
        onTouchMove={touchMove}
        onTouchEnd={touchEnd}
      >
        {data.map((item) => {
          return (
            <View key={item.key || item.label} style={s.item}>
              <Text style={textStyle}>{item.label}</Text>
            </View>
          );
        })}
      </Animated.View>
      <View style={s.indicator} pointerEvents="none" />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    position: "relative",
    height: itemHeight * itemCount,
    width: "30%",
    overflow: "hidden",
  },
  inner: {
    width: "100%",
  },
  item: {
    height: itemHeight,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    position: "absolute",
    left: 0,
    right: 0,
    top: indicatorUpperBounce,
    height: itemHeight,
    borderTopColor: "rgba(200,200,200,0.5)",
    borderTopWidth: 1,
    borderBottomColor: "rgba(200,200,200,0.5)",
    borderBottomWidth: 1,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});
