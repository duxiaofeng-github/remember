import React from "react";
import { StyleSheet } from "react-native";
import { colorText } from "../../utils/style";
import { WeekTimePicker, IWeekTimePickerProps } from "./picker/week-time-picker";
import { translate } from "../../utils/common";
import { Field, IFieldProps } from "./field";

interface IProps extends IWeekTimePickerProps, IFieldProps {}

export const WeekTimeSelect: React.SFC<IProps> = (props) => {
  const { label, error, ...restProps } = props;

  return (
    <Field label={label} error={error}>
      <WeekTimePicker
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
