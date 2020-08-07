import React from "react";
import { View, StyleSheet } from "react-native";
import { FieldError } from "react-hook-form";
import { Text } from "./text";
import { colorError, colorText } from "../../utils/style";
import { DateTimePicker, IDateTimePickerProps } from "./picker/date-time-picker";
import { translate } from "../../utils/common";

interface IProps extends IDateTimePickerProps {
  label?: string;
  error?: FieldError;
}

export const DateTimeSelect: React.SFC<IProps> = (props) => {
  const { label, error, ...restProps } = props;

  return (
    <View style={s.container}>
      {label && <Text style={s.label}>{label}</Text>}
      <DateTimePicker
        {...restProps}
        title={translate("Select time")}
        titleStyle={s.pickerText}
        textStyle={s.pickerText}
        dropDownIconColor={colorText}
      />
      {error && <Text style={s.error}>{error.message}</Text>}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  pickerText: {
    color: colorText,
  },
  error: {
    marginTop: 5,
    color: colorError,
    fontSize: 12,
  },
});
