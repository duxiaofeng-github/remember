import React, { useEffect, useState } from "react";
import { IBasicProps, IBasicData, IData } from "./picker-view";
import { pickerStore, IPickerStore } from "./provider";
import { Input } from "./input";

export interface IPickerProps<T> extends IBasicProps<T> {
  data: IBasicData<T>;
  dropDownIconColor?: string;
  value: T[];
}

export const Picker: <T>(p: IPickerProps<T>) => React.ReactElement<IPickerProps<T>> | null = (props) => {
  const { data, value, onCancel, onConfirm, textStyle, dropDownIconColor, ...restProps } = props;
  const [labels, setLabels] = useState<string[]>([]);

  function setVisible(visible: boolean) {
    pickerStore.update((store: IPickerStore) => {
      store.visible = visible;

      if (visible) {
        store.commonData = data;
      } else {
        store.commonData = undefined;
      }
    });
  }

  useEffect(() => {
    pickerStore.update((store: IPickerStore) => {
      store.visible = store.visible;
      store.textStyle = textStyle;

      const selectedIndexes = value.map((v, columnIndex) => {
        return data[columnIndex].findIndex((item) => item.value === v);
      });

      store.selectedIndexes = selectedIndexes;

      store.onCancel = () => {
        setVisible(false);

        if (onCancel) {
          onCancel();
        }
      };

      store.onConfirm = (value: any[], index: number[], records: IData<any>[]) => {
        setVisible(false);
        setLabels(
          records.map((item) => {
            return item.label;
          }),
        );

        if (onConfirm) {
          onConfirm(value, index, records);
        }
      };

      store.onInit = (labels) => {
        setLabels(labels);
      };

      Object.keys(restProps).forEach((key) => {
        (store as any)[key] = (restProps as any)[key];
      });

      store.commonData = data;
    });

    return () => {
      pickerStore.update((store) => {
        store.commonData = undefined;
      });
    };
  }, [props]);

  return (
    <Input
      textStyle={textStyle}
      dropDownIconColor={dropDownIconColor}
      text={labels.join(" ")}
      onTouchStart={() => {
        setVisible(true);
      }}
    />
  );
};
