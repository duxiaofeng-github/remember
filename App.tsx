import React from "react";
import "react-native-gesture-handler";
import { Index } from "./src/components";
import I18n from "react-native-i18n";
import { translations } from "./src/i18n";
import { globalStore } from "./src/store";
import { RexProvider } from "@jimengio/rex";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { PickerProvider } from "./src/components/common/picker/provider";

dayjs.extend(duration);

I18n.fallbacks = true;

I18n.translations = translations;

interface IProps {}

const App: React.SFC<IProps> = () => {
  return (
    <RexProvider value={globalStore}>
      <PickerProvider>
        <Index />
      </PickerProvider>
    </RexProvider>
  );
};

export default App;
