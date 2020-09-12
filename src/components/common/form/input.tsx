import React, {useState} from "react";
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
} from "react-native";
import {
  colorText,
  colorPrimary,
  colorBackgroundGray,
} from "../../../utils/style";
import {Field, IFieldProps} from "./field";

interface IProps extends IInputProps, TextInputProps, IFieldProps {}

export const InputField: React.SFC<IProps> = (props) => {
  const {label, error, multiline, onFocus, onBlur, ...restProps} = props;
  const [isFocus, setIsFocus] = useState(false);

  return (
    <Field
      label={label}
      error={error}
      labelStyle={isFocus && s.labelActived}
      block={multiline}>
      <Input
        {...restProps}
        multiline={multiline}
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

interface IInputProps extends TextInputProps {
  multiline?: boolean;
  rows?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input: React.SFC<IInputProps> = (props) => {
  const {
    multiline,
    rows = multiline ? 3 : 1,
    style,
    containerStyle,
    ...restProps
  } = props;
  const minHeight = rows * 18;
  const [height, setHeight] = useState(minHeight);

  return (
    <View style={[s.inputContainer, containerStyle]}>
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
      />
    </View>
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
