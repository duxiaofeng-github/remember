export enum RequestStatus {
  Pending,
  Sent,
}

export enum OpType {
  GetData = "getData",
  PutData = "putData",
  DelData = "delData",
}

export interface DBOptions {
  dbName: string;
  remoteAddr: string;
}

export interface GetDataOptions extends DBOptions {
  id?: string;
}

export interface PutDataOptions<T> extends DBOptions {
  data: T;
}
