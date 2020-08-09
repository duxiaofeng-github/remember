import React from "react";
import { StyleSheet } from "react-native";
import { colorText } from "../../utils/style";
import { TimePicker, ITimePickerProps } from "./picker/time-picker";
import { translate } from "../../utils/common";
import { Field, IFieldProps } from "./field";

interface IProps extends ITimePickerProps, IFieldProps {}

export const TimeSelect: React.SFC<IProps> = (props) => {
  const { label, error, ...restProps } = props;

  return (
    <Field label={label} error={error}>
      <TimePicker
        {...restProps}
        title={translate("Select time")}
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
