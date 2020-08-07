import React, { useState } from "react";
import { PickerView, IStoreProps } from "./picker-view";
import { IBasicData as IPickerBasicData } from "./picker-view";

export type IBasicData<T> = IData<T>[];

export interface IData<T> {
  key?: string;
  label: string;
  value: T;
  children?: IData<T>[];
}

interface IProps<T> extends IStoreProps<T> {
  data: IBasicData<T>;
}

export const CascadePickerView: <T>(p: IProps<T>) => React.ReactElement<IProps<T>> | null = (props) => {
  const { data, selectedIndexes, onChange, ...restProps } = props;
  const [innerSelectedIndexes, setInnerSelectedIndexes] = useState(selectedIndexes || []);

  function getData(indexes: number[]) {
    const data1 = data;
    const data1SelectedIndex = indexes[0] || 0;
    const data2 = data1[data1SelectedIndex] && data1[indexes[0] || 0].children;
    const data2SelectedIndex = indexes[1] || 0;
    const data3 = data2 && data2[data2SelectedIndex] && data2[data2SelectedIndex].children;
    const _data = [data1, data2, data3].filter((item) => item != null) as IPickerBasicData<any>;

    return _data;
  }

  return (
    <PickerView
      {...restProps}
      data={getData(innerSelectedIndexes)}
      selectedIndexes={selectedIndexes}
      onChange={(columnIndex, value, index) => {
        const tempIndexes = [...innerSelectedIndexes];

        tempIndexes[columnIndex] = index;

        const newData = getData(tempIndexes);

        const newIndexes: number[] = [];

        tempIndexes.forEach((index, columnIndex) => {
          if (newData[columnIndex] && newData[columnIndex][index]) {
            newIndexes[columnIndex] = index;
          }
        });

        setInnerSelectedIndexes(newIndexes);

        if (onChange) {
          onChange(
            columnIndex,
            value,
            index,
            newIndexes.map((index, columnIndex) => newData[columnIndex][index] && newData[columnIndex][index].value),
            newIndexes,
          );
        }
      }}
    />
  );
};
