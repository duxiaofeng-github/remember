import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { Picker } from "./picker";
import { TextStyle, StyleProp } from "react-native";
import weekday from "dayjs/plugin/weekday";

dayjs.extend(weekday);

export interface IWeekTimePickerProps {
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

export const WeekTimePicker: React.SFC<IWeekTimePickerProps> = (props) => {
  const { value, minTime, maxTime, title = "Select time", onChange, ...restProps } = props;
  const [innerValue, setInnerValue] = useState<number | undefined>(0);

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  const weeks = useMemo(() => getWeeks({ value: innerValue, minTime, maxTime }), [innerValue, minTime, maxTime]);
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
      data={[weeks, hours, minutes]}
      insertions={[[], [" "], [":"]]}
      onFormat={(labels, values) => {
        if (innerValue) {
          return dayjs.unix(innerValue).format("dddd HH:mm");
        }

        return "";
      }}
      onChange={(columnIndex, newValue, index, [weekDay, hour, minute]) => {
        setInnerValue(dayjs().weekday(weekDay).hour(hour).minute(minute).second(0).millisecond(0).unix());
      }}
      onConfirm={(newValue) => {
        if (onChange) {
          const newDate =
            newValue != null
              ? dayjs().weekday(newValue[0]).hour(newValue[1]).minute(newValue[2]).second(0).millisecond(0).unix()
              : undefined;
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

function getWeeks(options: IOptions) {
  const { minTime, maxTime } = parseOptions(options);
  const min = minTime ? minTime.weekday() : undefined;
  const max = maxTime ? maxTime.weekday() : undefined;

  return Array(7)
    .fill(0)
    .map((item, index) => index)
    .filter((value) => isInRange({ value, min, max }))
    .map((weekday) => {
      return { label: dayjs().weekday(weekday).format("dddd"), value: weekday };
    });
}

function getHours(options: IOptions) {
  const { value, minTime, maxTime } = parseOptions(options);
  const min = minTime && value.weekday() === minTime.weekday() ? minTime.hour() : undefined;
  const max = maxTime && value.weekday() === maxTime.weekday() ? maxTime.hour() : undefined;

  return Array(24)
    .fill(0)
    .map((item, index) => index)
    .filter((value) => isInRange({ value, min, max }));
}

function getMinutes(options: IOptions) {
  const { value, minTime, maxTime } = parseOptions(options);
  const min =
    minTime && value.weekday() === minTime.weekday() && value.hour() === minTime.hour() ? minTime.minute() : undefined;
  const max =
    maxTime && value.weekday() === maxTime.weekday() && value.hour() === maxTime.hour() ? maxTime.minute() : undefined;

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

  return valueParsed ? [valueParsed.weekday(), valueParsed.hour(), valueParsed.minute()] : undefined;
}
