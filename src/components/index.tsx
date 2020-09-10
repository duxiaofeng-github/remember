import React, {useEffect} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";
import {useTranslation} from "react-i18next";
import dayjs from "dayjs";
import {Home} from "./home/home";
import {RootStackParam, Route} from "../utils/route";
import {EditReward} from "./reward/edit-reward";
import {EditTask} from "./task/edit-task";
import {IStore} from "../store";
import {useRexContext} from "../store/store";
import {kebabCase} from "lodash";

interface IProps {}

const Stack = createStackNavigator<RootStackParam>();

export const Index: React.SFC<IProps> = () => {
  const {settingsData} = useRexContext((store: IStore) => store);
  const {i18n} = useTranslation();

  useEffect(() => {
    const {lang} = settingsData.data!;

    i18n.changeLanguage(lang);

    dayjs.locale(kebabCase(lang.toLowerCase()));
  }, [settingsData]);

  useEffect(() => {
    settingsData.load();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={Route.Home}
        screenOptions={{
          headerShown: false,
          animationTypeForReplace: "push",
          cardStyle: {height: "100%"},
        }}>
        <Stack.Screen name={Route.Home} component={Home} />
        <Stack.Screen name={Route.EditTask} component={EditTask} />
        <Stack.Screen name={Route.EditReward} component={EditReward} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
