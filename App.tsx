import React from "react";
import "react-native-gesture-handler";
import "react-native-get-random-values";
import {Index} from "./src/components";
import I18n from "react-native-i18n";
import {translations} from "./src/i18n";
import {globalStore, getInitialStore} from "./src/store";
import {RexProvider} from "./src/store/store";
import {PickerProvider} from "./src/components/common/picker/provider";
import {ToastProvider} from "./src/components/common/toast";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";
import "dayjs/locale/zh-cn";
import {PopupProvider} from "./src/components/common/popup";
import {OrbitDbBridge} from "./src/components/common/orbit-db-bridge";

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(duration);

I18n.fallbacks = true;

I18n.translations = translations;

interface IProps {}

const App: React.SFC<IProps> = () => {
  return (
    <RexProvider store={globalStore} initialValue={getInitialStore()}>
      <ToastProvider>
        <PopupProvider>
          <PickerProvider>
            <OrbitDbBridge />
            <Index />
          </PickerProvider>
        </PopupProvider>
      </ToastProvider>
    </RexProvider>
  );
};

export default App;
