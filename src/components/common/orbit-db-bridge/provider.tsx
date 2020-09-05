import React from "react";
import {RexProvider, createStore} from "../../../store/store";
import {RequestStatus} from "./interface";

type Resolver = (data: any) => void;

type Rejecter = (err: any) => void;

interface Request {
  timestamp: number;
  msg: string;
  status: RequestStatus;
  resolver: Resolver;
  rejecter: Rejecter;
}

export interface IStore {
  requests: Request[];
}

export const store = createStore<IStore>();

export function getPendingRequests(requests: Request[]) {
  return requests.filter((item) => item.status === RequestStatus.Pending);
}

export function setRequestsStatusToSent(requests: Request[]) {
  store.update((store) => {
    store.requests.forEach((request) => {
      if (requests.findIndex((item) => item.timestamp === request.timestamp)) {
        request.status === RequestStatus.Sent;
      }
    });
  });
}

interface IProps {}

export const Provider: React.SFC<IProps> = (props) => {
  return (
    <RexProvider
      store={store}
      initialValue={{
        requests: [],
      }}>
      {props.children}
    </RexProvider>
  );
};
