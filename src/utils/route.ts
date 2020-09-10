export type RootStackParam = {
  [Route.Home]: undefined;
  [Route.EditTask]: {planId?: string};
  [Route.EditReward]: {planId?: string};
};

export enum Route {
  Home = "home",
  Task = "task",
  EditTask = "editTask",
  Reward = "reward",
  EditReward = "editReward",
  Setting = "setting",
}
