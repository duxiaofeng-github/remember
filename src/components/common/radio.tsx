import React, {useEffect, useRef} from "react";
import {Animated, Easing, StyleSheet, View} from "react-native";
import {colorBackgroundGray, colorPrimary} from "../../utils/style";
import {Field, IFieldProps} from "./field";

interface IProps extends IFieldProps {
  value: boolean;
  defaultValue?: boolean;
  onChange: (value: boolean) => void;
}

export const Radio: React.SFC<IProps> = (props) => {
  const {label, error, defaultValue, value = defaultValue, onChange} = props;
  const translateXValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value) {
      Animated.timing(translateXValue, {
        toValue: 20,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(translateXValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  }, [value]);

  return (
    <Field label={label} error={error}>
      <View
        style={[s.container, value && s.containerActived]}
        onTouchStart={() => {
          onChange(!value);
        }}>
        <Animated.View
          style={[s.inner, {transform: [{translateX: translateXValue}]}]}
        />
      </View>
    </Field>
  );
};

const s = StyleSheet.create({
  container: {
    height: 22,
    width: 42,
    padding: 5,
    borderRadius: 11,
    backgroundColor: colorBackgroundGray,
  },
  containerActived: {
    backgroundColor: colorPrimary,
  },
  inner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
});
