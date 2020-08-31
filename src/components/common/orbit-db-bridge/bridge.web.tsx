import React, {useEffect, useRef} from "react";
import {IStore} from "./provider";
import {useRexContext} from "../../../store/store";
import {resolve} from "./sender";

interface IProps {}

export const Bridge: React.SFC<IProps> = (props) => {
  const iframeEl = useRef<HTMLIFrameElement>(null);
  const {hash} = useRexContext((store: IStore) => store);

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

  return (
    <iframe
      style={{display: "none"}}
      src={`/orbit-db-web/index.html#${encodeURIComponent(hash)}`}
      ref={iframeEl}
    />
  );
};
