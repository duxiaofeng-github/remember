import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Setting } from "../setting/setting";
import { Icon } from "react-native-elements";
import { colorPrimary } from "../../utils/style";
import { Reward } from "../reward/reward";
import { Route } from "../../utils/route";
import { Plan } from "../plan/plan";
import { translate } from "../../utils/common";

interface IProps {}

const Tab = createBottomTabNavigator();

export const Home: React.SFC<IProps> = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case Route.Plan:
              return <Icon type="feather" name="crosshair" color={focused ? colorPrimary : "gray"} />;
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
      <Tab.Screen name={Route.Plan} component={Plan} options={{ title: translate("plans") }} />
      <Tab.Screen name={Route.Reward} component={Reward} options={{ title: translate("rewards") }} />
      <Tab.Screen name={Route.Setting} component={Setting} options={{ title: translate("settings") }} />
    </Tab.Navigator>
  );
};
