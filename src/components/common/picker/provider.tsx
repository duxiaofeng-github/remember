import React from "react";
import { IBasicData as ICascadeData, CascadePickerView } from "./cascade-picker-view";
import { IBasicData, IStoreProps, PickerView } from "./picker-view";
import { RexProvider, createStore, useRexContext } from "../../../store/store";

export interface IPickerStore extends IStoreProps<any> {
  cascadeData?: ICascadeData<any>;
  commonData?: IBasicData<any>;
}

export const pickerStore = createStore<IPickerStore>();

interface IProps {}

export const PickerProvider: React.SFC<IProps> = (props) => {
  return (
    <>
      {props.children}
      <RexProvider
        store={pickerStore}
        initialValue={{
          visible: false,
        }}
      >
        <PickerWrapper />
      </RexProvider>
    </>
  );
};

const PickerWrapper: React.SFC = () => {
  const { cascadeData, commonData, ...restOptions } = useRexContext((store: IPickerStore) => store);

  return cascadeData ? (
    <CascadePickerView {...restOptions} data={cascadeData} />
  ) : commonData ? (
    <PickerView {...restOptions} data={commonData} />
  ) : null;
};
