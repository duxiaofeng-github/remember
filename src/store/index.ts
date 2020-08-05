import { createStore } from "@jimengio/rex";
import { Plan } from "../db/plan";

export interface IStore {
  lang: string;
  edittingPlan?: Plan;
}

export const initialStore: IStore = {
  lang: "en",
};

export const globalStore = createStore<IStore>(initialStore);
