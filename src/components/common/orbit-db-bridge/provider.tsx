import React from "react";
import {RexProvider, createStore} from "../../../store/store";

interface IProps {}

export interface IStore {
  hash: string;
}

export const store = createStore<IStore>();

export const Provider: React.SFC<IProps> = (props) => {
  return (
    <RexProvider
      store={store}
      initialValue={{
        hash: "",
      }}>
      {props.children}
    </RexProvider>
  );
};
