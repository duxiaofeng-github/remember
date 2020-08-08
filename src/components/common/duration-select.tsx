import React from "react";
import { StyleSheet } from "react-native";
import { colorText } from "../../utils/style";
import { DurationPicker, IDurationPickerProps } from "./picker/duration-picker";
import { Field, IFieldProps } from "./field";

interface IProps extends IDurationPickerProps, IFieldProps {}

export const DurationSelect: React.SFC<IProps> = (props) => {
  const { label, error, ...restProps } = props;

  return (
    <Field label={label} error={error}>
      <DurationPicker {...restProps} titleStyle={s.pickerText} textStyle={s.pickerText} dropDownIconColor={colorText} />
    </Field>
  );
};

const s = StyleSheet.create({
  pickerText: {
    color: colorText,
  },
});
