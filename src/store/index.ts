import { createStore } from "@jimengio/rex";

export interface IStore {
  lang: string;
}

export const initialStore: IStore = {
  lang: "en",
};

export const globalStore = createStore<IStore>(initialStore);
