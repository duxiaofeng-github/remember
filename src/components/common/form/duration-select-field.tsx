import React from "react";
import {StyleSheet} from "react-native";
import {colorText} from "../../../utils/style";
import {DurationPicker, IDurationPickerProps} from "../picker/duration-picker";
import {Field, IFieldProps} from "./field";
import {useTranslation} from "react-i18next";

interface IProps extends IDurationPickerProps, IFieldProps {}

export const DurationSelectField: React.SFC<IProps> = (props) => {
  const {label, error, ...restProps} = props;
  const {t} = useTranslation();

  return (
    <Field label={label} error={error}>
      <DurationPicker
        {...restProps}
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
