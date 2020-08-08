import React from "react";
import { View, StyleSheet, StyleProp, TextStyle } from "react-native";
import { FieldError } from "react-hook-form";
import { Text } from "./text";
import { colorError } from "../../utils/style";

export interface IFieldProps {
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  error?: FieldError;
}

export const Field: React.SFC<IFieldProps> = (props) => {
  const { label, labelStyle, error, children } = props;

  return (
    <View style={s.container}>
      {label && <Text style={[s.label, labelStyle]}>{label}</Text>}
      {children}
      {error && <Text style={s.error}>{error.message}</Text>}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  error: {
    marginTop: 5,
    color: colorError,
    fontSize: 12,
  },
});
