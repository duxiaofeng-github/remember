import React, { useMemo } from "react";
import { Picker } from "./picker";
import { TextStyle, StyleProp } from "react-native";
import dayjs from "dayjs";
import { secondsToDuration } from "../../../utils/common";

export interface IDurationPickerProps {
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
  cancelText?: string;
  cancelStyle?: StyleProp<TextStyle>;
  confirmText?: string;
  confirmStyle?: StyleProp<TextStyle>;
  value?: number;
  dropDownIconColor?: string;
  clearable?: boolean;
  prefix?: string;
  min?: number;
  max?: number;
  selectDays?: boolean;
  selectHours?: boolean;
  selectMinutes?: boolean;
  enabledUnits?: Unit[];
  onFormat?: (value?: number) => string;
  onFormatUnit?: (unit?: Unit) => string;
  onChange?: (value?: number) => void;
}

export enum Unit {
  Days = "Days",
  Hours = "Hours",
  Minutes = "Minutes",
}

const unitsArray = [Unit.Minutes, Unit.Hours, Unit.Days];

export const DurationPicker: React.SFC<IDurationPickerProps> = (props) => {
  const {
    value,
    min,
    max,
    selectDays,
    selectHours,
    selectMinutes,
    enabledUnits,
    title = "Select duration",
    onChange,
    onFormat,
    onFormatUnit,
    ...restProps
  } = props;
  const suffix = useMemo(() => {
    let _suffix;

    if (selectDays) {
      _suffix = Unit.Days;
    } else if (selectHours) {
      _suffix = Unit.Hours;
    } else if (selectMinutes) {
      _suffix = Unit.Minutes;
    }

    if (_suffix && onFormatUnit) {
      _suffix = onFormatUnit(_suffix);
    }

    return _suffix;
  }, [selectDays, selectHours, selectMinutes]);

  const data = useMemo(() => {
    const numbers = getNumbers(min || 1, max || 100);
    const numbersData = numbers.map((item) => {
      return { label: `${item}`, value: item };
    });
    const units = getUnits(enabledUnits);
    const unitsFormatted = onFormatUnit ? units.map((unit) => onFormatUnit(unit)) : units;
    const unitsData = unitsFormatted.map((item, index) => {
      return { label: item, value: index };
    });

    if (selectDays || selectHours || selectMinutes) {
      return [numbersData];
    } else {
      return [numbersData, unitsData];
    }
  }, [min, max, selectDays, selectHours, selectMinutes, enabledUnits]);

  const values = useMemo(
    () => transformSecondsToValues({ value, selectDays, selectHours, selectMinutes, enabledUnits }),
    [value, selectDays, selectHours, selectMinutes, enabledUnits],
  );

  return (
    <Picker
      {...restProps}
      title={title}
      value={values}
      data={data}
      suffix={suffix}
      onFormat={(newLabels, newValues) => {
        if (onFormat) {
          return onFormat(
            transformValuesToSeconds({ values: newValues, selectDays, selectHours, selectMinutes, enabledUnits }),
          );
        }

        return "";
      }}
      onConfirm={(newValues) => {
        if (onChange) {
          onChange(
            transformValuesToSeconds({ values: newValues, selectDays, selectHours, selectMinutes, enabledUnits }),
          );
        }
      }}
    />
  );
};

function transformSecondsToValues(options: {
  value?: number;
  selectDays?: boolean;
  selectHours?: boolean;
  selectMinutes?: boolean;
  enabledUnits?: Unit[];
}): number[] | undefined {
  const { value, selectDays, selectHours, selectMinutes, enabledUnits } = options;

  if (value) {
    const duration = secondsToDuration(value);
    const asDays = duration.asDays();

    const asHours = duration.asHours();
    const hours = duration.hours();

    const asMinutes = duration.asMinutes();
    const minutes = duration.minutes();

    const units = getUnits(enabledUnits);

    if (selectDays) {
      return [asDays];
    } else if (selectHours) {
      return [asHours];
    } else if (selectMinutes) {
      return [asMinutes];
    } else if (asDays >= 1 && hours === 0 && minutes === 0) {
      return [asDays, units.findIndex((item) => item === Unit.Days)];
    } else if (asHours >= 1 && minutes === 0) {
      return [asHours, units.findIndex((item) => item === Unit.Hours)];
    } else if (asMinutes >= 1) {
      return [asMinutes, units.findIndex((item) => item === Unit.Minutes)];
    }
  }
}

function transformValuesToSeconds(options: {
  values?: number[];
  selectDays?: boolean;
  selectHours?: boolean;
  selectMinutes?: boolean;
  enabledUnits?: Unit[];
}): number | undefined {
  const { values, selectDays, selectHours, selectMinutes, enabledUnits } = options;

  if (values) {
    const [number, unitIndex] = values;
    const units = getUnits(enabledUnits);
    const unit = units[unitIndex];

    if (number != null) {
      if (selectDays) {
        return dayjs.duration(number, "day").asSeconds();
      } else if (selectHours) {
        return dayjs.duration(number, "hour").asSeconds();
      } else if (selectMinutes) {
        return dayjs.duration(number, "minute").asSeconds();
      } else if (unit) {
        return dayjs.duration(number, transformUnitToDayjsUnit(unit)).asSeconds();
      }
    }
  }
}

function getNumbers(min: number, max: number) {
  return Array(max - min)
    .fill(0)
    .map((item, index) => index + min);
}

function transformUnitToDayjsUnit(unit: Unit) {
  switch (unit) {
    case Unit.Days:
      return "day";
    case Unit.Hours:
      return "hour";
    case Unit.Minutes:
      return "minute";
  }

  return "";
}

function getUnits(enabledUnits?: Unit[]) {
  return enabledUnits || unitsArray;
}
