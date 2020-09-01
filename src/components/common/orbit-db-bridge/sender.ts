import {GetDataOptions, OpType, PutDataOptions} from "./interface";
import {store} from "./provider";

function parse(message: string) {
  const [type, timestamp, payload] = message.split("::");
  const payloadParsed = JSON.parse(payload);
  const timestampInt = parseInt(timestamp);

  return {type, timestamp: timestampInt, payload: payloadParsed};
}

function format(type: OpType, payload: any) {
  const timestamp = Date.now();

  return {
    timestamp,
    msg: `${type}::${timestamp}::${JSON.stringify({data: payload})}`,
  };
}

type Resolver = (data: any) => void;

type Rejecter = (err: any) => void;

const promises: {
  [timestamp: number]: {resolver: Resolver; rejecter: Rejecter};
} = {};

function send<T>(options: {timestamp: number; msg: string}) {
  const {timestamp, msg} = options;

  return new Promise<T>((resolver, rejecter) => {
    promises[timestamp] = {resolver, rejecter};

    // setTimeout(() => {
    //   rejecter("time out");

    //   delete promises[timestamp];
    // }, 20 * 1000);

    store.update((store) => {
      store.request = msg;
    });
  });
}

export function resolve<T>(message: string) {
  const {timestamp, payload} = parse(message);
  const promise = promises[timestamp];

  if (promise) {
    promise.resolver(payload.result);

    delete promises[timestamp];
  }
}

export async function getData<R = any>(options: GetDataOptions) {
  return send<R>(format(OpType.GetData, options));
}

export async function putData<D = any, R = any>(options: PutDataOptions<D>) {
  return send<R>(format(OpType.PutData, options));
}

export async function delData<R = any>(options: GetDataOptions) {
  return send<R>(format(OpType.DelData, options));
}
