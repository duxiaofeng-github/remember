import React, {useEffect, useRef} from "react";
import {IStore} from "./provider";
import {useRexContext} from "../../../store/store";
import {resolve} from "./sender";

interface IProps {}

export const Bridge: React.SFC<IProps> = (props) => {
  const iframeEl = useRef<HTMLIFrameElement>(null);
  const {request} = useRexContext((store: IStore) => store);

  useEffect(() => {
    const iframe = iframeEl.current as any;
    const listener = (event: any) => {
      if (event.source === iframe.contentWindow) {
        resolve(event.data);
      }
    };

    if (iframe != null) {
      window.addEventListener("message", listener);
    }

    return () => {
      if (iframe != null) {
        window.removeEventListener("message", listener);
      }
    };
  });

  function sendRequest() {
    const iframe = iframeEl.current as any;

    if (
      iframe != null &&
      iframe.contentWindow.orbitdbRequest &&
      request !== ""
    ) {
      iframe.contentWindow.orbitdbRequest(request);
    }
  }

  useEffect(sendRequest, [request]);

  return (
    <iframe
      style={{display: "none"}}
      src={"/orbit-db/index.html"}
      onLoad={sendRequest}
      ref={iframeEl}
    />
  );
};
