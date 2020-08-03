import IPFS from "ipfs";
import OrbitDB from "orbit-db";
import { storage } from "../utils/storage";

let ipfsInstance: any;

async function getIpfsInstance() {
  if (ipfsInstance == null) {
    ipfsInstance = await IPFS.create({
      repo: "/remember/orbitdb",
      init: true,
      start: false,
      preload: {
        enabled: false,
      },
      EXPERIMENTAL: {
        pubsub: true,
      },
    });
  }

  return ipfsInstance;
}

async function getRemoteDbAddress() {
  const addr = await storage.getItem("remember-remote-db-addr");

  return addr;
}

let orbitDBInstance: any;

export async function getDBInstance() {
  if (orbitDBInstance == null) {
    const ipfsInstance = await getIpfsInstance();
    const remoteAddr = await getRemoteDbAddress();
    const isLocalMode = remoteAddr == null;

    if (!isLocalMode) {
      await ipfsInstance.start();
    }

    orbitDBInstance = await OrbitDB.createInstance(ipfsInstance, { id: "remember", offline: isLocalMode });
  }

  return orbitDBInstance;
}
