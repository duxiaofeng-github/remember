import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Task } from "../task/task";
import { Setting } from "../setting/setting";
import { Icon } from "react-native-elements";
import I18n from "react-native-i18n";
import { colorPrimary } from "../../utils/style";
import { Reward } from "../reward/reward";
import { Route } from "../../utils/route";

interface IProps {}

const Tab = createBottomTabNavigator();

export const Home: React.SFC<IProps> = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case Route.Task:
              return <Icon type="feather" name="list" color={focused ? colorPrimary : "gray"} />;
            case Route.Reward:
              return <Icon type="feather" name="gift" color={focused ? colorPrimary : "gray"} />;
            case Route.Setting:
              return <Icon type="feather" name="settings" color={focused ? colorPrimary : "gray"} />;
          }

          return null;
        },
      })}
      tabBarOptions={{
        activeTintColor: colorPrimary,
        inactiveTintColor: "gray",
        tabStyle: {
          paddingBottom: 5,
        },
      }}
    >
      <Tab.Screen name={Route.Task} component={Task} options={{ title: I18n.t("tasks") }} />
      <Tab.Screen name={Route.Reward} component={Reward} options={{ title: I18n.t("rewards") }} />
      <Tab.Screen name={Route.Setting} component={Setting} options={{ title: I18n.t("settings") }} />
    </Tab.Navigator>
  );
};
