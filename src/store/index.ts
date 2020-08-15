import { Plan } from "../db/plan";
import { createStore } from "./store";
import { loadPlans } from "./plan";
import { loadTasks } from "./task";
import { Task } from "../db/task";

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
  tasksData: IStoreData<Task[]>;
}

export function getInitialStore(): IStore {
  return {
    lang: "en",
    plansData: { loading: true, load: loadPlans },
    tasksData: { loading: true, load: loadTasks },
  };
}

export const globalStore = createStore<IStore>();
