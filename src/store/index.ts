import {Plan} from "../db/plan";
import {createStore} from "./store";
import {loadPlans} from "./plan";
import {loadRewardPlans} from "./reward";
import {defaultLocale} from "../utils/common";
import {RewardPlan} from "../db/reward";
import {Setting} from "../db/setting";
import {loadSettings} from "./setting";

interface IStoreData<T> {
  loading: boolean;
  error?: false | Error;
  data?: T;
  load: () => Promise<void>;
}

export interface IStore {
  edittingPlanId?: string;
  edittingRewardId?: string;
  plansData: IStoreData<Plan[]>;
  rewardPlansData: IStoreData<RewardPlan[]>;
  settingsData: IStoreData<Setting>;
}

export function getInitialStore(): IStore {
  return {
    plansData: {loading: true, load: loadPlans},
    rewardPlansData: {loading: true, load: loadRewardPlans},
    settingsData: {
      loading: true,
      data: {lang: defaultLocale, points: 0},
      load: loadSettings,
    },
  };
}

export const globalStore = createStore<IStore>();
