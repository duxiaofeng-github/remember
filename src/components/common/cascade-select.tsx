import React from "react";
import { StyleSheet } from "react-native";
import { CascadePicker, ICascadePickerProps } from "./picker/cascade-picker";
import { colorText } from "../../utils/style";
import { IFieldProps, Field } from "./field";
import { translate } from "../../utils/common";

interface IProps<T> extends ICascadePickerProps<T>, IFieldProps {}

export const CascadeSelect: <T>(p: IProps<T>) => React.ReactElement<IProps<T>> | null = (props) => {
  const { label, error, ...restProps } = props;

  return (
    <Field label={label} error={error}>
      <CascadePicker
        titleStyle={s.pickerText}
        textStyle={s.pickerText}
        dropDownIconColor={colorText}
        confirmText={translate("Confirm")}
        cancelText={translate("Cancel")}
        {...restProps}
      />
    </Field>
  );
};

const s = StyleSheet.create({
  pickerText: {
    color: colorText,
  },
});
