import React, {useEffect, useRef} from "react";
import {getPendingRequests, IStore, setRequestsStatusToSent} from "./provider";
import {useRexContext} from "../../../store/store";
import {resolve} from "./sender";

interface IProps {}

export const Bridge: React.SFC<IProps> = (props) => {
  const iframeEl = useRef<HTMLIFrameElement>(null);
  const {requests} = useRexContext((store: IStore) => store);

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

  function sendRequests() {
    const iframe = iframeEl.current as any;

    if (
      iframe != null &&
      iframe.contentWindow.orbitdbRequest &&
      requests.length
    ) {
      const pendingRequests = getPendingRequests(requests);

      pendingRequests.forEach((request) => {
        iframe.contentWindow.orbitdbRequest(request.msg);
      });

      setRequestsStatusToSent(pendingRequests);
    }
  }

  useEffect(sendRequests, [requests]);

  return (
    <iframe
      style={{display: "none"}}
      src={"/orbit-db/index.html"}
      onLoad={sendRequests}
      ref={iframeEl}
    />
  );
};
