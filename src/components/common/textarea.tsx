import React, { useState } from "react";
import { TextInput, TextInputProps, StyleSheet } from "react-native";
import { colorText, colorPrimary, colorError } from "../../utils/style";
import { Field, IFieldProps } from "./field";

interface IProps extends TextInputProps, IFieldProps {
  rows?: number;
}

export const Textarea: React.SFC<IProps> = (props) => {
  const { label, rows = 3, style, error, onFocus, onBlur, ...restProps } = props;
  const [isFocus, setIsFocus] = useState(false);

  return (
    <Field label={label} error={error} labelStyle={isFocus && s.labelActived}>
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
    </Field>
  );
};

const s = StyleSheet.create({
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
});
