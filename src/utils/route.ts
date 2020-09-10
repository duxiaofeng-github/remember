import {NavigationContainerRef} from "@react-navigation/native";
import {createRef} from "react";

export const navigationRef = createRef<NavigationContainerRef>();

export function navigate<RouteName extends keyof RootStackParam>(
  ...args: undefined extends RootStackParam[RouteName]
    ? [RouteName] | [RouteName, RootStackParam[RouteName]]
    : [RouteName, RootStackParam[RouteName]]
): void {
  if (navigationRef.current) {
    navigationRef.current.navigate(...args);
  }
}

export type RootStackParam = {
  [Route.Home]: undefined;
  [Route.Task]: undefined;
  [Route.Reward]: undefined;
  [Route.Setting]: undefined;
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
