import React, { useState } from "react";
import { TextInput, TextInputProps, View, StyleSheet } from "react-native";
import { FieldError } from "react-hook-form";
import { Text } from "./text";
import { colorText, colorPrimary, colorError } from "../../utils/style";

interface IProps extends TextInputProps {
  label?: string;
  error?: FieldError;
  rows?: number;
}

export const Textarea: React.SFC<IProps> = (props) => {
  const { label, rows = 3, style, error, onFocus, onBlur, ...restProps } = props;
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={s.container}>
      {label && <Text style={[s.label, isFocus && s.labelActived]}>{label}</Text>}
      <TextInput
        {...restProps}
        style={[{ minHeight: rows * 22 }, s.input, isFocus && s.inputActived, style]}
        multiline
        onFocus={(e) => {
          setIsFocus(true);

          if (onFocus) {
            onFocus(e);
          }
        }}
        onBlur={(e) => {
          setIsFocus(false);

          if (onBlur) {
            onBlur(e);
          }
        }}
      />
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
  labelActived: {
    color: colorPrimary,
  },
  input: {
    color: colorText,
    borderBottomWidth: 1,
    borderBottomColor: colorText,
  },
  inputActived: {
    borderBottomColor: colorPrimary,
  },
  error: {
    marginTop: 5,
    color: colorError,
    fontSize: 12,
  },
});
