import React, {useEffect, useRef} from "react";
import {getPendingRequests, IStore, setRequestsStatusToSent} from "./provider";
import {useRexContext} from "../../../store/store";
import {resolve} from "./sender";
import WebView from "react-native-webview";
import {Platform, View} from "react-native";

interface IProps {}

export const Bridge: React.SFC<IProps> = (props) => {
  const {requests} = useRexContext((store: IStore) => store);
  const webViewRef = useRef<WebView>(null);
  const baseUrl =
    Platform.OS === "ios" ? "orbit-db" : "file:///android_asset/orbit-db";

  function sendRequests() {
    if (webViewRef.current != null && requests.length) {
      const pendingRequests = getPendingRequests(requests);

      pendingRequests.forEach((request) => {
        webViewRef.current!.injectJavaScript(
          `
          if (window.orbitdbRequest) {
            window.orbitdbRequest('${request.msg}');
          }
          `,
        );
      });

      setRequestsStatusToSent(pendingRequests);
    }
  }

  useEffect(() => {
    sendRequests();
  }, [requests]);

  return (
    <View style={{height: 0, width: 0, display: "none"}}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{uri: `orbit-db/index.html`, baseUrl}}
        onLoadEnd={sendRequests}
        onMessage={(event) => {
          resolve(event.nativeEvent.data);
        }}
      />
    </View>
  );
};
