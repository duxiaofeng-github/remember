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
  const {message} = useRexContext((store: IToastStore) => store);
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message != null) {
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(opacityValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            toastStore.update((store) => {
              store.message = undefined;
            });
          });
        }, 2000);
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
}

const toastStore = createStore<IToastStore>();

export const Toast = {
  message: (message: string) => {
    toastStore.update((store) => {
      store.message = message;
    });
  },
};
