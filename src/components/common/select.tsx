import React from "react";
import { View, StyleSheet } from "react-native";
import { FieldError } from "react-hook-form";
import { Text } from "./text";
import { Picker, IPickerProps } from "./picker/picker";
import { colorError, colorText } from "../../utils/style";

interface IProps<T> extends IPickerProps<T> {
  label?: string;
  error?: FieldError;
}

export const Select: <T>(p: IProps<T>) => React.ReactElement<IProps<T>> | null = (props) => {
  const { label, error, ...restProps } = props;

  return (
    <View style={s.container}>
      {label && <Text style={s.label}>{label}</Text>}
      <Picker textStyle={s.pickerText} dropDownIconColor={colorText} {...restProps} />
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
  pickerText: {
    color: colorText,
  },
  error: {
    marginTop: 5,
    color: colorError,
    fontSize: 12,
  },
});
