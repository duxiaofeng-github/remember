import React from "react";
import "react-native-gesture-handler";
import { Index } from "./src/components";
import I18n from "react-native-i18n";
import { translations } from "./src/i18n";
import { globalStore } from "./src/store";
import { RexProvider } from "@jimengio/rex";

I18n.fallbacks = true;

I18n.translations = translations;

interface IProps {}

const App: React.SFC<IProps> = () => {
  return (
    <RexProvider value={globalStore}>
      <Index />
    </RexProvider>
  );
};

export default App;
