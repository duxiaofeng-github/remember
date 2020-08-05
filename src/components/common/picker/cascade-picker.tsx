import React, { useEffect, useState } from "react";
import { IBasicProps } from "./picker-view";
import { pickerStore, IPickerStore } from "./provider";
import { Input } from "./input";
import { IBasicData, IData } from "./cascade-picker-view";

export interface ICascadePickerProps<T> extends IBasicProps<T> {
  data: IBasicData<T>;
  dropDownIconColor?: string;
  value: T[];
}

export const CascadePicker: <T>(p: ICascadePickerProps<T>) => React.ReactElement<ICascadePickerProps<T>> | null = (
  props,
) => {
  const { data, value, onCancel, onConfirm, textStyle, dropDownIconColor, ...restProps } = props;
  const [labels, setLabels] = useState<string[]>([]);

  function setVisible(visible: boolean) {
    pickerStore.update((store: IPickerStore) => {
      store.visible = visible;

      if (visible) {
        store.cascadeData = data;
      } else {
        store.cascadeData = undefined;
      }
    });
  }

  useEffect(() => {
    pickerStore.update((store: IPickerStore) => {
      store.visible = store.visible;
      store.textStyle = textStyle;

      const data1 = data.find((item) => item.value === value[0]);
      const data1Index = data.findIndex((item) => item.value === value[0]);
      const data2 = data1 && data1.children ? data1.children.find((item) => item.value === value[1]) : undefined;
      const data2Index = data1 && data1.children ? data1.children.findIndex((item) => item.value === value[1]) : -1;
      const data3Index = data2 && data2.children ? data2.children.findIndex((item) => item.value === value[2]) : -1;

      const selectedIndexes = [data1Index, data2Index, data3Index].filter((item) => item != -1) as any;

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

      store.cascadeData = data;
    });

    return () => {
      pickerStore.update((store) => {
        store.cascadeData = undefined;
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
