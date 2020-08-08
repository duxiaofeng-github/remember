import React, { useState } from "react";
import { TextInput, TextInputProps, StyleSheet } from "react-native";
import { colorText, colorPrimary } from "../../utils/style";
import { Field, IFieldProps } from "./field";

interface IProps extends TextInputProps, IFieldProps {}

export const Input: React.SFC<IProps> = (props) => {
  const { label, style, error, onFocus, onBlur, ...restProps } = props;
  const [isFocus, setIsFocus] = useState(false);

  return (
    <Field label={label} error={error} labelStyle={isFocus && s.labelActived}>
      <TextInput
        {...restProps}
        style={[s.input, isFocus && s.inputActived, style]}
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
    </Field>
  );
};

const s = StyleSheet.create({
  input: {
    color: colorText,
    borderBottomWidth: 1,
    borderBottomColor: colorText,
  },
  inputActived: {
    borderBottomColor: colorPrimary,
  },
  labelActived: {
    color: colorPrimary,
  },
});
