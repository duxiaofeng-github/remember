import React from "react";
import { StyleSheet } from "react-native";
import { Picker, IPickerProps } from "./picker/picker";
import { colorText } from "../../utils/style";
import { Field, IFieldProps } from "./field";

interface IProps<T> extends IPickerProps<T>, IFieldProps {}

export const Select: <T>(p: IProps<T>) => React.ReactElement<IProps<T>> | null = (props) => {
  const { label, error, ...restProps } = props;

  return (
    <Field label={label} error={error}>
      <Picker titleStyle={s.pickerText} textStyle={s.pickerText} dropDownIconColor={colorText} {...restProps} />
    </Field>
  );
};

const s = StyleSheet.create({
  pickerText: {
    color: colorText,
  },
});
