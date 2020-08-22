export enum OpType {
  GetData = "getData",
  PutData = "putData",
  DelData = "delData",
}

interface DBOptions {
  dbName: string;
  remoteAddr: string;
}

export interface GetDataOptions extends DBOptions {
  id?: string;
}

export interface PutDataOptions<T> extends DBOptions {
  data: T;
}
