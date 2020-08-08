import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { Picker } from "./picker";
import { formatTime } from "../../../utils/common";
import { TextStyle, StyleProp } from "react-native";

export interface IDateTimePickerProps {
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

export const DateTimePicker: React.SFC<IDateTimePickerProps> = (props) => {
  const { value, minTime, maxTime, title = "Select time", onChange, ...restProps } = props;
  const [innerValue, setInnerValue] = useState<number | undefined>(0);

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  const years = useMemo(() => toDataArray(getYears({ value: innerValue, minTime, maxTime })), [
    innerValue,
    minTime,
    maxTime,
  ]);
  const months = useMemo(() => toDataArray(getMonths({ value: innerValue, minTime, maxTime }), false, 1), [
    innerValue,
    minTime,
    maxTime,
  ]);
  const dates = useMemo(() => toDataArray(getDates({ value: innerValue, minTime, maxTime })), [
    innerValue,
    minTime,
    maxTime,
  ]);
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
      data={[years, months, dates, hours, minutes]}
      onFormat={(labels, values) => {
        if (values) {
          const [year, month, date, hour, minute] = values;

          return dayjs(new Date(year, month, date, hour, minute)).format("YYYY/MM/DD HH:mm");
        }

        return "";
      }}
      onChange={(columnIndex, newValue, index, [year, month, date, hour, minute]) => {
        setInnerValue(dayjs(new Date(year, month, date, hour, minute)).unix());
      }}
      onConfirm={(newValue) => {
        if (onChange) {
          const newDate =
            newValue != null
              ? dayjs(new Date(newValue[0], newValue[1], newValue[2], newValue[3], newValue[4])).unix()
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

function getHours(options: IOptions) {
  const { value, minTime, maxTime } = parseOptions(options);
  const min =
    minTime && value.isSame(minTime, "year") && value.isSame(minTime, "month") && value.isSame(minTime, "date")
      ? minTime.hour()
      : undefined;
  const max =
    maxTime && value.isSame(maxTime, "year") && value.isSame(maxTime, "month") && value.isSame(maxTime, "date")
      ? maxTime.hour()
      : undefined;

  return Array(24)
    .fill(0)
    .map((item, index) => index)
    .filter((value) => isInRange({ value, min, max }));
}

function getMinutes(options: IOptions) {
  const { value, minTime, maxTime } = parseOptions(options);
  const min =
    minTime &&
    value.isSame(minTime, "year") &&
    value.isSame(minTime, "month") &&
    value.isSame(minTime, "date") &&
    value.isSame(minTime, "hour")
      ? minTime.minute()
      : undefined;
  const max =
    maxTime &&
    value.isSame(maxTime, "year") &&
    value.isSame(maxTime, "month") &&
    value.isSame(maxTime, "date") &&
    value.isSame(maxTime, "hour")
      ? maxTime.minute()
      : undefined;

  return Array(60)
    .fill(0)
    .map((item, index) => index)
    .filter((value) => isInRange({ value, min, max }));
}

function getDates(options: IOptions) {
  const { value, minTime, maxTime } = parseOptions(options);
  const daysInMonth = value.endOf("month").daysInMonth();
  const min = minTime && value.isSame(minTime, "year") && value.isSame(minTime, "month") ? minTime.date() : undefined;
  const max = maxTime && value.isSame(maxTime, "year") && value.isSame(maxTime, "month") ? maxTime.date() : undefined;

  return Array(daysInMonth)
    .fill(0)
    .map((item, index) => index + 1)
    .filter((value) => isInRange({ value, min, max }));
}

function getMonths(options: IOptions) {
  const { value, minTime, maxTime } = parseOptions(options);
  const min = minTime && value.isSame(minTime, "year") ? minTime.month() : undefined;
  const max = maxTime && value.isSame(maxTime, "year") ? maxTime.month() : undefined;

  return Array(12)
    .fill(0)
    .map((item, index) => index)
    .filter((value) => isInRange({ value, min, max }));
}

const offsetYearsCount = 100;

function getYears(options: IOptions) {
  const { value, minTime, maxTime } = parseOptions(options);
  const year = value.year();
  const min = minTime ? minTime.year() : undefined;
  const max = maxTime ? maxTime.year() : undefined;

  return Array(offsetYearsCount * 2 + 1)
    .fill(0)
    .map((item, index) => year - offsetYearsCount + index)
    .filter((value) => isInRange({ value, min, max }));
}

function toDataArray(values: number[], prefix = false, offset = 0) {
  return values.map((item) => {
    return { label: item < 10 && prefix ? `0${item + offset}` : `${item + offset}`, value: item };
  });
}

function transformValueToValues(value?: number) {
  const valueParsed = value ? dayjs.unix(value) : undefined;

  return valueParsed
    ? [valueParsed.year(), valueParsed.month(), valueParsed.date(), valueParsed.hour(), valueParsed.minute()]
    : undefined;
}
