import IPFS from "ipfs";
import OrbitDB from "orbit-db";
import { storage } from "../utils/storage";

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

async function getRemoteDbAddress() {
  const addr = await storage.getItem("remember-remote-db-addr");

  return addr;
}

let orbitDBInstance: any;

async function getOrbitDBInstance() {
  if (orbitDBInstance == null) {
    const ipfsInstance = await getIpfsInstance();
    const remoteAddr = await getRemoteDbAddress();
    const isLocalMode = remoteAddr == null;

    if (!isLocalMode) {
      await ipfsInstance.start();
    }

    orbitDBInstance = await OrbitDB.createInstance(ipfsInstance, {
      id: "remember",
      offline: isLocalMode,
    });
  }

  return orbitDBInstance;
}

const dbs: { [dbName: string]: any } = {};

export async function getDb(dbName: string, type: "docs" | "kv") {
  const db = dbs[dbName];

  if (db) {
    return db;
  }

  const orbitDbInstance = await getOrbitDBInstance();
  const newDb = type === "docs" ? await orbitDbInstance.docs(dbName) : await orbitDbInstance.keyvalue(dbName);

  await newDb.load();

  dbs[dbName] = newDb;

  return newDb;
}
