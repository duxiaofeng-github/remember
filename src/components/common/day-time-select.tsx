import React from "react";
import {StyleSheet} from "react-native";
import {colorText} from "../../utils/style";
import {DayTimePicker, IDayTimePickerProps} from "./picker/day-time-picker";
import {useTranslation} from "react-i18next";
import {Field, IFieldProps} from "./field";

interface IProps extends IDayTimePickerProps, IFieldProps {}

export const DayTimeSelect: React.SFC<IProps> = (props) => {
  const {label, error, ...restProps} = props;
  const {t} = useTranslation();

  return (
    <Field label={label} error={error}>
      <DayTimePicker
        {...restProps}
        title={t("Select date")}
        titleStyle={s.pickerText}
        textStyle={s.pickerText}
        confirmText={t("Confirm")}
        cancelText={t("Cancel")}
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
