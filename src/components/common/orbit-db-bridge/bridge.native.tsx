import React from "react";
import {IStore} from "./provider";
import {useRexContext} from "../../../store/store";
import {resolve} from "./sender";
import WebView from "react-native-webview";

interface IProps {}

export const Bridge: React.SFC<IProps> = (props) => {
  const {hash} = useRexContext((store: IStore) => store);

  return (
    <WebView
      style={{display: "none"}}
      originWhitelist={["*"]}
      source={{uri: `file://orbit-db/index.html#${encodeURIComponent(hash)}`}}
      onMessage={(event) => {
        resolve(event.nativeEvent.data);
      }}
    />
  );
};
