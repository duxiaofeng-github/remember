import React from "react";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Setting} from "../setting/setting";
import {Icon} from "../common/icon";
import {colorPrimary} from "../../utils/style";
import {Route} from "../../utils/route";
import {useTranslation} from "react-i18next";
import {Task} from "../task/task";
import {Rewards} from "../reward/reward";

interface IProps {}

const Tab = createBottomTabNavigator();

export const Home: React.SFC<IProps> = () => {
  const {t} = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        unmountOnBlur: true,
        tabBarIcon: ({focused, color, size}) => {
          switch (route.name) {
            case Route.Task:
              return (
                <Icon
                  name="clock"
                  size={size}
                  color={focused ? colorPrimary : "gray"}
                />
              );
            case Route.Reward:
              return (
                <Icon
                  name="gift"
                  size={size}
                  color={focused ? colorPrimary : "gray"}
                />
              );
            case Route.Setting:
              return (
                <Icon
                  name="settings"
                  size={size}
                  color={focused ? colorPrimary : "gray"}
                />
              );
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
      }}>
      <Tab.Screen
        name={Route.Task}
        component={Task}
        options={{title: t("Tasks")}}
      />
      <Tab.Screen
        name={Route.Reward}
        component={Rewards}
        options={{title: t("Rewards")}}
      />
      <Tab.Screen
        name={Route.Setting}
        component={Setting}
        options={{title: t("Settings")}}
      />
    </Tab.Navigator>
  );
};
