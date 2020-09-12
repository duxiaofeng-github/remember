import React from "react";
import {StyleSheet} from "react-native";
import {colorText} from "../../../utils/style";
import {WeekTimePicker, IWeekTimePickerProps} from "../picker/week-time-picker";
import {useTranslation} from "react-i18next";
import {Field, IFieldProps} from "./field";

interface IProps extends IWeekTimePickerProps, IFieldProps {}

export const WeekTimeSelectField: React.SFC<IProps> = (props) => {
  const {label, error, ...restProps} = props;
  const {t} = useTranslation();

  return (
    <Field label={label} error={error}>
      <WeekTimePicker
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
