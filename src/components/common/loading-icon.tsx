import React, {useRef, useEffect} from "react";
import {Icon} from "../common/icon";
import {Animated, Easing, StyleSheet} from "react-native";
import {colorText} from "../../utils/style";

interface IProps {}

export const LoadingIcon: React.SFC<IProps> = (props) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ).start();
  }, []);

  return (
    <Animated.View style={[s.container, {transform: [{rotate: spin}]}]}>
      <Icon name="loader" size={30} color={colorText} />
    </Animated.View>
  );
};

const s = StyleSheet.create({
  container: {flex: 1, alignItems: "center", justifyContent: "center"},
});
