import { createStore } from "@jimengio/rex";

export interface IStore {}

export const initialStore: IStore = {};

export const globalStore = createStore<IStore>(initialStore);
