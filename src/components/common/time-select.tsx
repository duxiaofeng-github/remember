import React from "react";
import {StyleSheet} from "react-native";
import {colorText} from "../../utils/style";
import {TimePicker, ITimePickerProps} from "./picker/time-picker";
import {useTranslation} from "react-i18next";
import {Field, IFieldProps} from "./field";

interface IProps extends ITimePickerProps, IFieldProps {}

export const TimeSelect: React.SFC<IProps> = (props) => {
  const {label, error, ...restProps} = props;
  const {t} = useTranslation();

  return (
    <Field label={label} error={error}>
      <TimePicker
        {...restProps}
        title={t("Select time")}
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
