import React, { useEffect, useRef, ReactNode } from "react";
import { StyleSheet, Animated, View } from "react-native";
import { RexProvider, createStore, useRexContext } from "../../store/store";

interface IProps {}

export const PopupProvider: React.SFC<IProps> = (props) => {
  return (
    <>
      {props.children}
      <RexProvider store={popupStore}>
        <PopupImpl />
      </RexProvider>
    </>
  );
};

const PopupImpl: React.SFC<IProps> = (props) => {
  const { options } = useRexContext((store: IPopupStore) => store);
  const { onClose, children, closable = true } = options || {};
  const opacityValue = useRef(new Animated.Value(0)).current;

  function close() {
    Animated.timing(opacityValue, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(async () => {
      if (onClose) {
        onClose();
      }

      await popupStore.update((store: IPopupStore) => {
        store.options = undefined;
      });
    });
  }

  useEffect(() => {
    popupStore.update((store) => {
      store.close = close;
    });
  }, [onClose]);

  useEffect(() => {
    if (children != null) {
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [children]);

  return (
    <Animated.View
      pointerEvents={children == null ? "none" : "auto"}
      style={[s.container, { opacity: opacityValue }]}
      onTouchStart={() => {
        if (closable) {
          close();
        }
      }}
    >
      <View
        style={s.content}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    borderRadius: 3,
    padding: 8,
    backgroundColor: "#fff",
  },
});

interface IPopupOptions {
  closable?: boolean;
  children?: ReactNode;
  onClose?: () => void;
}

interface IPopupStore {
  options?: IPopupOptions;
  close?: () => void;
}

const popupStore = createStore<IPopupStore>();

export const Popup = {
  show: async (options: IPopupOptions) => {
    await popupStore.update((store) => {
      store.options = options;
    });

    return popupStore.getState().close;
  },
};
