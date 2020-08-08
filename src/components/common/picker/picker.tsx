import React, { useMemo, useEffect, useState, ReactNode } from "react";
import { IPickerViewProps, IBasicData, IData } from "./picker-view";
import { pickerStore, IPickerStore } from "./provider";
import { Input } from "./input";

export interface IPickerProps<T> extends IPickerViewProps<T> {
  data: IBasicData<T>;
  dropDownIcon?: ReactNode;
  dropDownIconColor?: string;
  clearable?: boolean;
  value?: T[];
  onFormat?: (labels?: string[], values?: T[]) => string;
}

export const Picker: <T>(p: IPickerProps<T>) => React.ReactElement<IPickerProps<T>> | null = (props) => {
  const {
    data,
    value,
    onFormat,
    onCancel,
    onConfirm,
    textStyle,
    dropDownIcon,
    dropDownIconColor,
    clearable,
    ...restProps
  } = props;
  const { selectedIndexes, labels, values } = useMemo(() => getSelectedIndexesAndLabelsByValue(data, value), [
    data,
    value,
  ]);
  const [innerVisible, setInnerVisible] = useState(false);

  function syncStore() {
    pickerStore.update((store: IPickerStore) => {
      store.commonData = data;
      store.textStyle = textStyle;
      store.selectedIndexes = selectedIndexes;
      store.onCancel = () => {
        setVisible(false);

        if (onCancel) {
          onCancel();
        }
      };
      store.onConfirm = (value?: any[], index?: number[], records?: IData<any>[]) => {
        setVisible(false);

        if (onConfirm) {
          onConfirm(value, index, records);
        }
      };

      Object.keys(restProps).forEach((key) => {
        (store as any)[key] = (restProps as any)[key];
      });
    });
  }

  function discardStore() {
    pickerStore.update((store: IPickerStore) => {
      store.commonData = undefined;
      store.textStyle = undefined;
      store.selectedIndexes = undefined;
      store.onCancel = undefined;
      store.onConfirm = undefined;

      Object.keys(restProps).forEach((key) => {
        (store as any)[key] = undefined;
      });
    });
  }

  useEffect(() => {
    if (innerVisible) {
      syncStore();
    }

    return () => {
      if (innerVisible) {
        discardStore();
      }
    };
  }, [props]);

  function setVisible(visible: boolean) {
    pickerStore.update((store: IPickerStore) => {
      setInnerVisible(visible);

      store.visible = visible;
    });

    if (visible) {
      syncStore();
    } else {
      discardStore();
    }
  }

  return (
    <Input
      textStyle={textStyle}
      dropDownIcon={dropDownIcon}
      dropDownIconColor={dropDownIconColor}
      showClearIcon={clearable && values != null}
      text={onFormat ? onFormat(labels, values) : labels ? labels.join(" ") : ""}
      onIconTouchStart={() => {
        if (clearable && values && onConfirm) {
          onConfirm();
        }
      }}
      onTouchStart={() => {
        setVisible(true);
      }}
    />
  );
};

export function getSelectedIndexesAndLabelsByValue<T>(data: IBasicData<T>, value?: T[]) {
  const selectedIndexes = value
    ? value.map((v, columnIndex) => {
        return data[columnIndex].findIndex((item) => item.value === v);
      })
    : undefined;

  let newIndexes: number[] | undefined = undefined;

  if (selectedIndexes) {
    newIndexes = [];

    data.forEach((item, columnIndex) => {
      if (newIndexes) {
        newIndexes[columnIndex] = (selectedIndexes && selectedIndexes[columnIndex]) || 0;
      }
    });

    newIndexes.forEach((index, columnIndex) => {
      if (newIndexes) {
        newIndexes[columnIndex] = data[columnIndex][index] ? index : 0;
      }
    });
  }

  const newItems = newIndexes
    ? (newIndexes.map((index, columnIndex) => data[columnIndex][index]).filter((item) => item != null) as IData<T>[])
    : undefined;

  const newLabels = newItems ? newItems.map((item) => item.label) : undefined;
  const newValues = newItems ? newItems.map((item) => item.value) : undefined;

  return { selectedIndexes: newIndexes, labels: newLabels, values: newValues };
}
