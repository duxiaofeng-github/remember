import nodejs from "nodejs-mobile-react-native";
import { GetDataOptions, OpType, PutDataOptions } from "./interface";

function parse(message: string) {
  const [type, timestamp, payload] = message.split("::");
  const payloadParsed = JSON.parse(payload);
  const timestampInt = parseInt(timestamp);

  return { timestamp: timestampInt, payload: payloadParsed };
}

function format(type: OpType, payload: any) {
  const timestamp = Date.now();

  return { timestamp, msg: `${type}::${timestamp}::${JSON.stringify({ result: payload })}` };
}

type Resolver = (data: any) => void;

type Rejecter = (err: any) => void;

const promises: {
  [timestamp: number]: { resolver: Resolver; rejecter: Rejecter };
} = {};

function send<T>(options: { timestamp: number; msg: string }) {
  const { timestamp, msg } = options;

  return new Promise<T>((resolver, rejecter) => {
    promises[timestamp] = { resolver, rejecter };

    setTimeout(() => {
      rejecter("time out");

      delete promises[timestamp];
    }, 20 * 1000);

    nodejs.channel.send(msg);
  });
}

export async function getData<R>(options: GetDataOptions) {
  return send<R>(format(OpType.GetData, options));
}

export async function putData<D, R>(options: PutDataOptions<D>) {
  return send<R>(format(OpType.PutData, options));
}

export async function delData<R>(options: GetDataOptions) {
  return send<R>(format(OpType.DelData, options));
}

nodejs.start("main.js");

nodejs.channel.addListener("message", (msg) => {
  const { timestamp, payload } = parse(msg);

  const promise = promises[timestamp];

  promise.resolver(payload);

  delete promises[timestamp];
});
