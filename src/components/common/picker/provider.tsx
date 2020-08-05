import React from "react";
import { RexProvider, useRexContext } from "@jimengio/rex";
import { createStore } from "@jimengio/rex";
import { IBasicData as ICascadeData, CascadePickerView } from "./cascade-picker-view";
import { IBasicData, IStoreProps, PickerView } from "./picker-view";

export interface IPickerStore extends IStoreProps<any> {
  cascadeData?: ICascadeData<any>;
  commonData?: IBasicData<any>;
}

const initialStore: IPickerStore = {
  visible: false,
};

export const pickerStore = createStore<IPickerStore>(initialStore);

interface IProps {}

export const PickerProvider: React.SFC<IProps> = (props) => {
  return (
    <>
      {props.children}
      <RexProvider value={pickerStore}>
        <PickerWrapper />
      </RexProvider>
    </>
  );
};

const PickerWrapper: React.SFC = () => {
  const { cascadeData, commonData, ...restOptions } = useRexContext((store: IPickerStore) => {
    return store;
  });

  return cascadeData ? (
    <CascadePickerView {...restOptions} data={cascadeData} />
  ) : commonData ? (
    <PickerView {...restOptions} data={commonData} />
  ) : null;
};
