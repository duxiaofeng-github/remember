import React from "react";
import {Provider} from "./provider";
import {Bridge} from "./bridge";

interface IProps {}

export const OrbitDbBridge: React.SFC<IProps> = (props) => {
  return (
    <Provider>
      <Bridge />
    </Provider>
  );
};
