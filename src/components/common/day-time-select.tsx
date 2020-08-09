import React from "react";
import { StyleSheet } from "react-native";
import { colorText } from "../../utils/style";
import { DayTimePicker, IDayTimePickerProps } from "./picker/day-time-picker";
import { translate } from "../../utils/common";
import { Field, IFieldProps } from "./field";

interface IProps extends IDayTimePickerProps, IFieldProps {}

export const DayTimeSelect: React.SFC<IProps> = (props) => {
  const { label, error, ...restProps } = props;

  return (
    <Field label={label} error={error}>
      <DayTimePicker
        {...restProps}
        title={translate("Select date")}
        titleStyle={s.pickerText}
        textStyle={s.pickerText}
        confirmText={translate("Confirm")}
        cancelText={translate("Cancel")}
        dropDownIconColor={colorText}
      />
    </Field>
  );
};

const s = StyleSheet.create({
  pickerText: {
    color: colorText,
  },
});
