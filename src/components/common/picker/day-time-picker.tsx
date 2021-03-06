import React, {useState, useEffect, useMemo} from "react";
import dayjs from "dayjs";
import {Picker} from "./picker";
import {TextStyle, StyleProp} from "react-native";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormat);

export interface IDayTimePickerProps {
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

export const DayTimePicker: React.SFC<IDayTimePickerProps> = (props) => {
  const {
    value,
    minTime,
    maxTime,
    title = "Select time",
    onChange,
    ...restProps
  } = props;
  const [innerValue, setInnerValue] = useState<number | undefined>(0);

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  const dates = useMemo(() => getDates({value: innerValue, minTime, maxTime}), [
    innerValue,
    minTime,
    maxTime,
  ]);
  const hours = useMemo(
    () => toDataArray(getHours({value: innerValue, minTime, maxTime}), true),
    [innerValue, minTime, maxTime],
  );
  const minutes = useMemo(
    () => toDataArray(getMinutes({value: innerValue, minTime, maxTime}), true),
    [innerValue, minTime, maxTime],
  );

  const values = useMemo(() => transformValueToValues(innerValue), [
    innerValue,
  ]);

  return (
    <Picker
      {...restProps}
      title={title}
      value={values}
      data={[dates, hours, minutes]}
      insertions={[[], [" "], [":"]]}
      onFormat={(labels, values) => {
        if (innerValue) {
          return dayjs.unix(innerValue).format("Do HH:mm");
        }

        return "";
      }}
      onChange={(columnIndex, newValue, index, [date, hour, minute]) => {
        setInnerValue(
          dayjs()
            .date(date)
            .hour(hour)
            .minute(minute)
            .second(0)
            .millisecond(0)
            .unix(),
        );
      }}
      onConfirm={(newValue) => {
        if (onChange) {
          const newDate =
            newValue != null
              ? dayjs()
                  .date(newValue[0])
                  .hour(newValue[1])
                  .minute(newValue[2])
                  .second(0)
                  .millisecond(0)
                  .unix()
              : undefined;
          onChange(newDate);
        }
      }}
    />
  );
};

function isInRange(options: {value: number; min?: number; max?: number}) {
  const {value, min, max} = options;

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
  const {value, minTime, maxTime} = options;

  return {
    value: value ? dayjs.unix(value) : dayjs(),
    minTime: minTime ? dayjs.unix(minTime) : undefined,
    maxTime: maxTime ? dayjs.unix(maxTime) : undefined,
  };
}

function getDates(options: IOptions) {
  const {minTime, maxTime} = parseOptions(options);
  const min = minTime ? minTime.date() : undefined;
  const max = maxTime ? maxTime.date() : undefined;

  return Array(31)
    .fill(0)
    .map((item, index) => index + 1)
    .filter((value) => isInRange({value, min, max}))
    .map((date) => {
      return {label: dayjs().month(0).date(date).format("Do"), value: date};
    });
}

function getHours(options: IOptions) {
  const {value, minTime, maxTime} = parseOptions(options);
  const min =
    minTime && value.date() === minTime.date() ? minTime.hour() : undefined;
  const max =
    maxTime && value.date() === maxTime.date() ? maxTime.hour() : undefined;

  return Array(24)
    .fill(0)
    .map((item, index) => index)
    .filter((value) => isInRange({value, min, max}));
}

function getMinutes(options: IOptions) {
  const {value, minTime, maxTime} = parseOptions(options);
  const min =
    minTime &&
    value.date() === minTime.date() &&
    value.hour() === minTime.hour()
      ? minTime.minute()
      : undefined;
  const max =
    maxTime &&
    value.date() === maxTime.date() &&
    value.hour() === maxTime.hour()
      ? maxTime.minute()
      : undefined;

  return Array(60)
    .fill(0)
    .map((item, index) => index)
    .filter((value) => isInRange({value, min, max}));
}

function toDataArray(values: number[], prefix = false, offset = 0) {
  return values.map((item) => {
    return {
      label: item < 10 && prefix ? `0${item + offset}` : `${item + offset}`,
      value: item,
    };
  });
}

function transformValueToValues(value?: number) {
  const valueParsed = value ? dayjs.unix(value) : undefined;

  return valueParsed
    ? [valueParsed.date(), valueParsed.hour(), valueParsed.minute()]
    : undefined;
}
