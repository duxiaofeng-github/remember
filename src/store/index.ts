import { Plan } from "../db/plan";
import { createStore } from "./store";
import { loadPlans } from "./plan";

interface IStoreData<T> {
  loading: boolean;
  error?: false | Error;
  data?: T;
  load: () => Promise<void>;
}

export interface IStore {
  lang: string;
  edittingPlanId?: string;
  plansData: IStoreData<Plan[]>;
}

export function getInitialStore(): IStore {
  return {
    lang: "en",
    plansData: { loading: true, load: loadPlans },
  };
}

export const globalStore = createStore<IStore>();
