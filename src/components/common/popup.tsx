import React, {useEffect, useRef, ReactNode} from "react";
import {
  StyleSheet,
  Animated,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import {RexProvider, createStore, useRexContext} from "../../store/store";
import {Text} from "./text";
import i18n from "../../i18n";
import {colorBorder, colorPrimary, colorTextLight} from "../../utils/style";
import {useBackHandler} from "@react-native-community/hooks";

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
  const {options} = useRexContext((store: IPopupStore) => store);
  const {onClose, children, contentStyle, closable = true} = options || {};
  const opacityValue = useRef(new Animated.Value(0)).current;

  useBackHandler(() => {
    if (children != null) {
      close();

      return true;
    }

    return false;
  });

  function close() {
    return new Promise<void>((resolve) => {
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(async () => {
        resolve();

        if (onClose) {
          onClose();
        }

        await popupStore.update((store: IPopupStore) => {
          store.options = undefined;
        });
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
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [children]);

  return (
    <Animated.View
      pointerEvents={children == null ? "none" : "auto"}
      style={[s.container, {opacity: opacityValue}]}
      onTouchStart={() => {
        if (closable) {
          close();
        }
      }}>
      <View
        style={[s.content, contentStyle]}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}>
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    borderRadius: 3,
    backgroundColor: "#fff",
  },
});

interface IPopupOptions {
  closable?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
  onClose?: () => void;
}

interface IConfirmOptions {
  content: string;
  confirmTextStyle?: StyleProp<TextStyle>;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface IPopupStore {
  options?: IPopupOptions;
  close?: () => Promise<void>;
}

const popupStore = createStore<IPopupStore>();

export const Popup = {
  show: async (options: IPopupOptions) => {
    await popupStore.update((store) => {
      store.options = options;
    });

    return popupStore.getState().close!;
  },
  confirm: async (options: IConfirmOptions) => {
    const {content, confirmTextStyle, onCancel, onConfirm} = options;
    let closeHandler: () => Promise<void>;

    async function close() {
      if (closeHandler) {
        await closeHandler();
      }
    }

    await popupStore.update((store) => {
      store.options = {
        closable: false,
        contentStyle: confirmStyle.container,
        children: (
          <>
            <View style={confirmStyle.content}>
              <Text style={confirmStyle.contentText}>{content}</Text>
            </View>
            <View style={confirmStyle.confirmFooter}>
              <View
                style={confirmStyle.footerButton}
                onTouchStart={async () => {
                  await close();

                  if (onCancel) {
                    onCancel();
                  }
                }}>
                <Text style={confirmStyle.cancelText}>{i18n.t("Cancel")}</Text>
              </View>
              <View
                style={[
                  confirmStyle.footerButton,
                  confirmStyle.buttonLeftBorder,
                ]}
                onTouchStart={async () => {
                  await close();

                  if (onConfirm) {
                    onConfirm();
                  }
                }}>
                <Text style={[confirmStyle.confirmText, confirmTextStyle]}>
                  {i18n.t("Confirm")}
                </Text>
              </View>
            </View>
          </>
        ),
      };
    });

    closeHandler = popupStore.getState().close!;

    return closeHandler;
  },
};

const confirmStyle = StyleSheet.create({
  container: {
    width: "70%",
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  contentText: {
    fontSize: 16,
  },
  confirmFooter: {
    borderTopWidth: 1,
    borderTopColor: colorBorder,
    flexDirection: "row",
  },
  footerButton: {
    width: "50%",
    paddingTop: 15,
    paddingBottom: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonLeftBorder: {
    borderLeftColor: colorBorder,
    borderLeftWidth: 1,
  },
  confirmText: {
    color: colorPrimary,
  },
  cancelText: {
    color: colorTextLight,
  },
});
