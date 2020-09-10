import React, {useState} from "react";
import {TextInput, TextInputProps, StyleSheet, View} from "react-native";
import {colorText, colorPrimary, colorBackgroundGray} from "../../utils/style";
import {Field, IFieldProps} from "./field";

interface IProps extends TextInputProps, IFieldProps {
  multiline?: boolean;
  rows?: number;
}

export const Input: React.SFC<IProps> = (props) => {
  const {
    label,
    multiline,
    rows = multiline ? 3 : 1,
    style,
    error,
    onFocus,
    onBlur,
    ...restProps
  } = props;
  const [isFocus, setIsFocus] = useState(false);
  const minHeight = rows * 18;
  const [height, setHeight] = useState(minHeight);

  return (
    <Field
      label={label}
      error={error}
      labelStyle={isFocus && s.labelActived}
      block={multiline}>
      <View style={s.inputContainer}>
        <TextInput
          {...restProps}
          style={[
            {height, textAlign: multiline ? "auto" : "right"},
            s.input,
            style,
          ]}
          multiline={multiline}
          textAlignVertical="top"
          onContentSizeChange={
            multiline
              ? (event) => {
                  const contentHeight = event.nativeEvent.contentSize.height;

                  setHeight(Math.max(minHeight, contentHeight));
                }
              : undefined
          }
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
      </View>
    </Field>
  );
};

const s = StyleSheet.create({
  labelActived: {
    color: colorPrimary,
  },
  inputContainer: {
    backgroundColor: colorBackgroundGray,
    borderRadius: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 12,
    paddingRight: 12,
  },
  input: {
    color: colorText,
    paddingTop: 0,
    paddingBottom: 0,
    fontSize: 14,
    lineHeight: 18,
    minWidth: 80,
  },
});
