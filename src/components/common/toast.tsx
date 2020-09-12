import React, {useEffect, useRef} from "react";
import {StyleSheet, Text, Animated} from "react-native";
import {RexProvider, createStore, useRexContext} from "../../store/store";

interface IProps {}

export const ToastProvider: React.SFC<IProps> = (props) => {
  return (
    <>
      {props.children}
      <RexProvider store={toastStore}>
        <ToastImpl />
      </RexProvider>
    </>
  );
};

const ToastImpl: React.SFC<IProps> = (props) => {
  const {message, keep} = useRexContext((store: IToastStore) => store);
  const opacityValue = useRef(new Animated.Value(0)).current;

  function show(cb?: () => void) {
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(cb);
  }

  function hide(cb?: () => void) {
    Animated.timing(opacityValue, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(cb);
  }

  function clear() {
    toastStore.update((store) => {
      store.message = undefined;
      store.keep = undefined;
    });
  }

  useEffect(() => {
    if (message != null) {
      show(() => {
        if (!keep) {
          setTimeout(() => {
            hide(() => {
              clear();
            });
          }, 1000);
        }
      });
    } else {
      hide(() => {
        clear();
      });
    }
  }, [message]);

  return (
    <Animated.View
      style={[s.container, {opacity: opacityValue}]}
      pointerEvents="none">
      <Text style={s.text}>{message}</Text>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "10%",
    alignItems: "center",
  },
  text: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 3,
    padding: 8,
    color: "#fff",
  },
});

interface IToastStore {
  message?: string;
  keep?: boolean;
}

const toastStore = createStore<IToastStore>();

export const Toast = {
  message: (message: string, keep?: boolean) => {
    toastStore.update((store) => {
      store.message = message;
      store.keep = keep;
    });

    return () => {
      toastStore.update((store) => {
        store.message = undefined;
      });
    };
  },
};
