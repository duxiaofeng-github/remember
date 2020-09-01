import "abort-controller/polyfill";
import IPFS from "ipfs";
import OrbitDB from "orbit-db";

import {GetDataOptions, PutDataOptions, OpType} from "./interface";

let ipfsInstance: any;

async function getIpfsInstance() {
  if (ipfsInstance == null) {
    // (window as any).parent.console.log(`getIpfsInstance`);

    ipfsInstance = await IPFS.create({
      repo: "./path-for-js-ipfs-repo",
      start: false,
      // init: true,
      // preload: {
      //   enabled: false,
      // },
      // EXPERIMENTAL: {
      //   pubsub: false,
      // },
      // config: {
      //   Addresses: {
      //     Swarm: [
      //       // Use IPFS dev signal server
      //       // '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
      //       "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star",
      //       // Use local signal server
      //       // '/ip4/0.0.0.0/tcp/9090/wss/p2p-webrtc-star',
      //     ],
      //   },
      // },
    });
  }

  return ipfsInstance;
}

let orbitDBInstance: any;

async function getOrbitDBInstance(remoteAddr: string) {
  if (orbitDBInstance == null) {
    const ipfsInstance = await getIpfsInstance();
    const isRemoteMode = !!remoteAddr;

    if (isRemoteMode) {
      await ipfsInstance.start();
    }

    // (window as any).parent.console.log(`getOrbitDBInstance`);

    orbitDBInstance = await OrbitDB.createInstance(ipfsInstance, {
      id: "remember",
      offline: !isRemoteMode,
    });
  }

  return orbitDBInstance;
}

const dbs: {[dbName: string]: any} = {};

async function getDb(options: {dbName: string; remoteAddr: string}) {
  const {dbName, remoteAddr} = options;
  const db = dbs[dbName];

  if (db) {
    return db;
  }

  // (window as any).parent.console.log(`orbitDbInstance start`);

  const orbitDbInstance = await getOrbitDBInstance(remoteAddr);

  // (window as any).parent.console.log(`orbitDbInstance`, orbitDbInstance);

  const newDb = await orbitDbInstance.docs(dbName);

  // (window as any).parent.console.log(`orbitDbInstance.docs`, newDb);

  await newDb.load();

  // (window as any).parent.console.log(`orbitDbInstance.docs load`, newDb);

  dbs[dbName] = newDb;

  return newDb;
}

function parse(message: string) {
  const [type, timestamp, payload] = message.split("::");
  // (window as any).parent.console.log(type, timestamp, payload);

  const payloadParsed = JSON.parse(payload);
  // (window as any).parent.console.log(payloadParsed);

  const timestampInt = parseInt(timestamp);

  return {
    type: type as OpType,
    timestamp: timestampInt,
    payload: payloadParsed,
  };
}

function format(type: OpType, timestamp: number, payload: any) {
  return `${type}::${timestamp}::${JSON.stringify({result: payload})}`;
}

export async function getData(options: GetDataOptions) {
  const {dbName, remoteAddr, id} = options;
  // (window as any).parent.console.log(`get data`, dbName, remoteAddr, id);
  const db = await getDb({dbName, remoteAddr});

  if (id != null) {
    return db.get(id);
  } else {
    return db.query(() => true);
  }
}

export async function putData<D>(options: PutDataOptions<D>) {
  const {data, dbName, remoteAddr} = options;
  const db = await getDb({dbName, remoteAddr});

  return db.put(data);
}

export async function delData(options: GetDataOptions) {
  const {dbName, remoteAddr, id} = options;
  const db = await getDb({dbName, remoteAddr});

  return db.del(id);
}

async function processEvent(type: OpType, timestamp: number, payload: any) {
  let result;

  switch (type) {
    case "getData":
      result = await getData(payload);
      break;
    case "putData":
      result = await putData(payload);
      break;
    case "delData":
      result = await delData(payload);
      break;
  }

  const message = format(type, timestamp, result);

  // (window as any).parent.console.log(`got result: ${message}`);

  send(message);
}

function send(message: string) {
  if ((window as any).ReactNativeWebView) {
    // (window as any).parent.console.log(`ReactNativeWebView sended: ${message}`);
    (window as any).ReactNativeWebView.postMessage(message);
  } else {
    // (window as any).parent.console.log(`postMessage: ${message}`);

    window.parent.postMessage(message, "*");
  }
}

(window as any).orbitdbRequest = function (message: string) {
  const {type, timestamp, payload} = parse(message);

  // (window as any).parent.console.log(`message changed: ${message}`);

  processEvent(type, timestamp, payload.data);
};

// (window as any).orbitdbRequest(
//   'getData::1598964178428::{"data":{"dbName":"plans","remoteAddr":""}}',
// );
