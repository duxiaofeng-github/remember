import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { Picker } from "./picker";
import { TextStyle, StyleProp } from "react-native";

export interface ITimePickerProps {
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
  cancelText?: string;
  cancelStyle?: StyleProp<TextStyle>;
  confirmText?: string;
  confirmStyle?: StyleProp<TextStyle>;
  value?: number;
  minTime?: number;
  maxTime?: number;
  dropDownIconColor?: string;
  clearable?: boolean;
  onChange?: (value?: number) => void;
}

export const TimePicker: React.SFC<ITimePickerProps> = (props) => {
  const { value, minTime, maxTime, title = "Select time", onChange, ...restProps } = props;
  const [innerValue, setInnerValue] = useState<number | undefined>(0);

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  const hours = useMemo(() => toDataArray(getHours({ value: innerValue, minTime, maxTime }), true), [
    innerValue,
    minTime,
    maxTime,
  ]);
  const minutes = useMemo(() => toDataArray(getMinutes({ value: innerValue, minTime, maxTime }), true), [
    innerValue,
    minTime,
    maxTime,
  ]);

  const values = useMemo(() => transformValueToValues(innerValue), [innerValue]);

  return (
    <Picker
      {...restProps}
      title={title}
      value={values}
      data={[hours, minutes]}
      insertions={[[], [":"]]}
      onFormat={(labels, values) => {
        if (innerValue) {
          return dayjs.unix(innerValue).format("HH:mm");
        }

        return "";
      }}
      onChange={(columnIndex, newValue, index, [hour, minute]) => {
        setInnerValue(dayjs(new Date(0, 0, 0, hour, minute, 0, 0)).unix());
      }}
      onConfirm={(newValue) => {
        if (onChange) {
          const newDate =
            newValue != null ? dayjs(new Date(0, 0, 0, newValue[0], newValue[1], 0, 0)).unix() : undefined;
          onChange(newDate);
        }
      }}
    />
  );
};

function isInRange(options: { value: number; min?: number; max?: number }) {
  const { value, min, max } = options;

  if (min != null && max != null) {
    if (min > max) {
      return value === min;
    } else {
      return value >= min && value <= max;
    }
  } else if (min != null) {
    return value >= min;
  } else if (max != null) {
    return value <= max;
  }

  return true;
}

interface IOptions {
  value?: number;
  minTime?: number;
  maxTime?: number;
}

function parseOptions(options: IOptions) {
  const { value, minTime, maxTime } = options;

  return {
    value: value ? dayjs.unix(value) : dayjs(),
    minTime: minTime ? dayjs.unix(minTime) : undefined,
    maxTime: maxTime ? dayjs.unix(maxTime) : undefined,
  };
}

function getHours(options: IOptions) {
  const { minTime, maxTime } = parseOptions(options);
  const min = minTime ? minTime.hour() : undefined;
  const max = maxTime ? maxTime.hour() : undefined;

  return Array(24)
    .fill(0)
    .map((item, index) => index)
    .filter((value) => isInRange({ value, min, max }));
}

function getMinutes(options: IOptions) {
  const { value, minTime, maxTime } = parseOptions(options);
  const min = minTime && value.hour() === minTime.hour() ? minTime.minute() : undefined;
  const max = maxTime && value.hour() === maxTime.hour() ? maxTime.minute() : undefined;

  return Array(60)
    .fill(0)
    .map((item, index) => index)
    .filter((value) => isInRange({ value, min, max }));
}

function toDataArray(values: number[], prefix = false, offset = 0) {
  return values.map((item) => {
    return { label: item < 10 && prefix ? `0${item + offset}` : `${item + offset}`, value: item };
  });
}

function transformValueToValues(value?: number) {
  const valueParsed = value ? dayjs.unix(value) : undefined;

  return valueParsed ? [valueParsed.hour(), valueParsed.minute()] : undefined;
}
