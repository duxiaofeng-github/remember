import React, {useEffect} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";
import {useTranslation} from "react-i18next";
import dayjs from "dayjs";
import {Home} from "./home/home";
import {Route} from "../utils/route";
import {EditReward} from "./reward/edit-reward";
import {EditPlan} from "./task/edit-plan";
import {useData} from "../utils/hooks/use-data";
import {getSettings} from "../db/setting";
import {Loading} from "./common/loading";
import {globalStore, IStore} from "../store";
import {useRexContext} from "../store/store";
import {scheduler} from "../utils/scheduler";

interface IProps {}

const Stack = createStackNavigator();

export const Index: React.SFC<IProps> = () => {
  const {lang} = useRexContext((store: IStore) => store);
  const {i18n} = useTranslation();

  const options = useData(async () => {
    const settings = await getSettings();

    if (settings) {
      globalStore.update((store) => {
        store.lang = settings.lang;
      });
    }
  });

  useEffect(() => {
    i18n.changeLanguage(lang);

    dayjs.locale(lang.toLowerCase());
  }, [lang]);

  useEffect(() => {
    scheduler.check();
  }, []);

  return (
    <Loading
      options={options}
      render={() => {
        return (
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={Route.Home}
              screenOptions={{
                headerShown: false,
                cardStyle: {height: "100%"},
              }}>
              <Stack.Screen name={Route.Home} component={Home} />
              <Stack.Screen name={Route.EditPlan} component={EditPlan} />
              <Stack.Screen name={Route.EditReward} component={EditReward} />
            </Stack.Navigator>
          </NavigationContainer>
        );
      }}
    />
  );
};
