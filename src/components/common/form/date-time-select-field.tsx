import React from "react";
import {StyleSheet} from "react-native";
import {useTranslation} from "react-i18next";
import {colorText} from "../../../utils/style";
import {DateTimePicker, IDateTimePickerProps} from "../picker/date-time-picker";
import {Field, IFieldProps} from "./field";

interface IProps extends IDateTimePickerProps, IFieldProps {}

export const DateTimeSelectField: React.SFC<IProps> = (props) => {
  const {label, error, ...restProps} = props;
  const {t} = useTranslation();

  return (
    <Field label={label} error={error}>
      <DateTimePicker
        {...restProps}
        title={t("Select date")}
        titleStyle={s.pickerText}
        textStyle={s.pickerText}
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
      />
    </Field>
  );
};

const s = StyleSheet.create({
  pickerText: {
    color: colorText,
  },
});
