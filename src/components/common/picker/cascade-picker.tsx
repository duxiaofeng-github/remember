import React, { useMemo, useState, useEffect } from "react";
import { IBasicProps } from "./picker-view";
import { pickerStore, IPickerStore } from "./provider";
import { Input } from "./input";
import { IBasicData, IData } from "./cascade-picker-view";

export interface ICascadePickerProps<T> extends IBasicProps<T> {
  data: IBasicData<T>;
  dropDownIconColor?: string;
  value?: T[];
  onFormat?: (labels: string[]) => string;
}

export const CascadePicker: <T>(p: ICascadePickerProps<T>) => React.ReactElement<ICascadePickerProps<T>> | null = (
  props,
) => {
  const { data, value, onFormat, onCancel, onConfirm, textStyle, dropDownIconColor, ...restProps } = props;
  const { selectedIndexes, labels } = useMemo(() => getSelectedIndexesAndLabelsByValue(data, value), [data, value]);
  const [innerVisible, setInnerVisible] = useState(false);

  function syncStore() {
    pickerStore.update((store: IPickerStore) => {
      store.cascadeData = data;
      store.textStyle = textStyle;
      store.selectedIndexes = selectedIndexes;
      store.onCancel = () => {
        setVisible(false);

        if (onCancel) {
          onCancel();
        }
      };
      store.onConfirm = (value: any[], index: number[], records: IData<any>[]) => {
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
      store.cascadeData = undefined;
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
      dropDownIconColor={dropDownIconColor}
      text={labels ? (onFormat ? onFormat(labels) : labels.join(" ")) : ""}
      onTouchStart={() => {
        setVisible(true);
      }}
    />
  );
};

interface IItemAndIndex<T> {
  item: IData<T>;
  index: number;
}

export function getItemAndIndexByItems<T>(value: T, data?: IData<T>[]): IItemAndIndex<T> | null {
  if (data != null) {
    const index = data.findIndex((item) => item.value === value);

    if (index !== -1) {
      return { item: data[index], index };
    } else {
      // return default index 0
      return { item: data[0], index: 0 };
    }
  }

  return null;
}

export function getSelectedIndexesAndLabelsByValue<T>(data: IData<T>[], value?: T[]) {
  let dataArray: IData<T>[] | undefined = data;

  const selectedItemsInfo = value
    ? (value
        .map((v) => {
          let result = getItemAndIndexByItems(v, dataArray);

          if (result != null) {
            dataArray = result.item.children;
          }

          return result;
        })
        .filter((item) => item != null) as IItemAndIndex<T>[])
    : undefined;
  const selectedIndexes = selectedItemsInfo
    ? selectedItemsInfo.map((item) => {
        return item.index;
      })
    : undefined;
  const labels = selectedItemsInfo
    ? selectedItemsInfo.map((item) => {
        return item.item.label;
      })
    : undefined;

  return {
    selectedIndexes,
    labels,
  };
}
