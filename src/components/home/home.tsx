import React from "react";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Setting} from "../setting/setting";
import {Icon} from "../common/icon";
import {colorPrimary} from "../../utils/style";
import {Reward} from "../reward/reward";
import {Route} from "../../utils/route";
import {translate} from "../../utils/common";
import {useRexContext} from "../../store/store";
import {IStore} from "../../store";
import {Task} from "../task/task";

interface IProps {}

const Tab = createBottomTabNavigator();

export const Home: React.SFC<IProps> = () => {
  const {lang} = useRexContext((store: IStore) => store);

  return (
    <Tab.Navigator
      key={lang}
      screenOptions={({route}) => ({
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
        options={{title: translate("tasks")}}
      />
      <Tab.Screen
        name={Route.Reward}
        component={Reward}
        options={{title: translate("rewards")}}
      />
      <Tab.Screen
        name={Route.Setting}
        component={Setting}
        options={{title: translate("settings")}}
      />
    </Tab.Navigator>
  );
};
