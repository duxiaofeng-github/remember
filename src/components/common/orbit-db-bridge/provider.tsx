import React from "react";
import {RexProvider, createStore} from "../../../store/store";

interface IProps {}

export interface IStore {
  request: string;
}

export const store = createStore<IStore>();

export const Provider: React.SFC<IProps> = (props) => {
  return (
    <RexProvider
      store={store}
      initialValue={{
        request: "",
      }}>
      {props.children}
    </RexProvider>
  );
};
