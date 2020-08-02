import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Home } from "./home/home";
import { Route } from "../utils/route";
import { EditTask } from "./task/edit-task";
import { EditReward } from "./reward/edit-reward";

interface IProps {}

const Stack = createStackNavigator();

export const Index: React.SFC<IProps> = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={Route.Home}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name={Route.Home} component={Home} />
        <Stack.Screen name={Route.EditTask} component={EditTask} />
        <Stack.Screen name={Route.EditReward} component={EditReward} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
