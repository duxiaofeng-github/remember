import IPFS from "ipfs";
import OrbitDB from "orbit-db";
import { GetDataOptions, PutDataOptions } from "./interface";

let ipfsInstance: any;

async function getIpfsInstance() {
  if (ipfsInstance == null) {
    ipfsInstance = await IPFS.create({
      repo: "./path-for-js-ipfs-repo",
      // init: true,
      start: false,
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

    orbitDBInstance = await OrbitDB.createInstance(ipfsInstance, {
      id: "remember",
      offline: !isRemoteMode,
    });
  }

  return orbitDBInstance;
}

const dbs: { [dbName: string]: any } = {};

async function getDb(options: { dbName: string; remoteAddr: string }) {
  const { dbName, remoteAddr } = options;
  const db = dbs[dbName];

  if (db) {
    return db;
  }

  const orbitDbInstance = await getOrbitDBInstance(remoteAddr);
  const newDb = await orbitDbInstance.docs(dbName);

  await newDb.load();

  dbs[dbName] = newDb;

  return newDb;
}

export async function getData(options: GetDataOptions) {
  const { dbName, remoteAddr, id } = options;
  const db = await getDb({ dbName, remoteAddr });

  if (id != null) {
    return db.get(id);
  } else {
    return db.query(() => true);
  }
}

export async function putData<D>(options: PutDataOptions<D>) {
  const { data, dbName, remoteAddr } = options;
  const db = await getDb({ dbName, remoteAddr });

  return db.put(data);
}

export async function delData(options: GetDataOptions) {
  const { dbName, remoteAddr, id } = options;
  const db = await getDb({ dbName, remoteAddr });

  return db.del(id);
}
