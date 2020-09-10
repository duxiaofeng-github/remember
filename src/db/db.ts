import {storage} from "../utils/storage";
import {
  GetDataOptions,
  PutDataOptions,
} from "../components/common/orbit-db-bridge/interface";

function getDBName(dbName: string) {
  return `remember.${dbName}`;
}

export async function getData<R = any>(options: GetDataOptions): Promise<R> {
  const {dbName, id} = options;
  const results = await storage.getItem(getDBName(dbName));
  const resultsParsed = results != null ? JSON.parse(results) : undefined;

  if (id != null) {
    return resultsParsed != null
      ? resultsParsed.find((item: any) => item._id === id)
      : null;
  } else {
    return resultsParsed != null ? resultsParsed : [];
  }
}

export async function putData<D = any, R = any>(options: PutDataOptions<D>) {
  const {dbName, remoteAddr, data} = options;
  const results = await getData({dbName, remoteAddr});
  const dataIndex = results.findIndex(
    (item: any) => item._id === (data as any)._id,
  );

  if (dataIndex === -1) {
    results.push(data);
  } else {
    results.splice(dataIndex, 1, data);
  }

  await storage.setItem(getDBName(dbName), JSON.stringify(results));
}

export async function delData<R = any>(options: GetDataOptions) {
  const {dbName, remoteAddr, id} = options;
  const results = await getData({dbName, remoteAddr});
  const dataIndex = results.findIndex((item: any) => item._id === id);

  if (dataIndex !== -1) {
    results.splice(dataIndex, 1);
  }

  await storage.setItem(getDBName(dbName), JSON.stringify(results));
}
