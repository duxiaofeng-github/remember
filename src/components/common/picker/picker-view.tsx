import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Dimensions,
  Animated,
  StyleSheet,
  Easing,
  StyleProp,
  TextStyle,
  GestureResponderEvent,
} from "react-native";
import { Topbar } from "./top-bar";
import { ScrollView } from "./scroll-view";

const panelHeight = 220;

function getWindowHeight() {
  return Dimensions.get("window").height;
}

function getVisibleTop() {
  return getWindowHeight() - panelHeight;
}

export type IBasicData<T> = IData<T>[][];

export interface IData<T> {
  key?: string;
  label: string;
  value: T;
}

export interface IStyleProps {
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
  cancelText?: string;
  cancelStyle?: StyleProp<TextStyle>;
  confirmText?: string;
  confirmStyle?: StyleProp<TextStyle>;
}

export interface IBasicProps<T> extends IStyleProps {
  onConfirm?: (values: T[], indexes: number[], records: IData<T>[]) => void;
  onCancel?: () => void;
  onChange?: (columnIndex: number, value: T, index: number, values: T[], indexes: number[]) => void;
}

export interface IStoreProps<T> extends IBasicProps<T> {
  selectedIndexes?: number[];
  visible: boolean;
}

interface IProps<T> extends IStoreProps<T> {
  data: IBasicData<T>;
}

export const PickerView: <T>(p: IProps<T>) => React.ReactElement<IProps<T>> | null = (props) => {
  const {
    visible,
    data,
    title,
    titleStyle,
    textStyle,
    cancelText,
    cancelStyle,
    confirmText,
    confirmStyle,
    selectedIndexes,
    onCancel,
    onConfirm,
    onChange,
  } = props;
  const topValue = useRef(new Animated.Value(getWindowHeight())).current;
  const [innerSelectedIndexes, setInnerSelectIndexes] = useState<number[]>([]);
  const [innerVisible, setInnerVisible] = useState(visible);

  function popup(callback?: () => void) {
    setInnerVisible(true);

    Animated.timing(topValue, {
      toValue: getVisibleTop(),
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start(callback);
  }

  function hide(callback?: () => void) {
    Animated.timing(topValue, {
      toValue: getWindowHeight(),
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      setInnerVisible(false);

      if (callback) {
        callback();
      }
    });
  }

  function cancel() {
    hide(() => {
      if (onCancel) {
        onCancel();
      }
    });
  }

  function confirm() {
    hide(() => {
      if (onConfirm) {
        const records = innerSelectedIndexes.map((index, columnIndex) => data[columnIndex][index]);
        const values = records.map((item) => item.value);

        onConfirm(values, innerSelectedIndexes, records);
      }
    });
  }

  useEffect(() => {
    if (visible) {
      popup();
    } else {
      hide();
    }
  }, [visible]);

  useEffect(() => {
    const defaultIndexes = data.map(() => 0);
    setInnerSelectIndexes(selectedIndexes || defaultIndexes);
  }, [selectedIndexes, data]);

  return (
    <View style={[s.container, innerVisible && s.containerVisible]} onTouchStart={cancel}>
      <Animated.View
        style={[s.panel, { top: topValue }]}
        onTouchStart={(e: GestureResponderEvent) => {
          e.stopPropagation();
        }}
      >
        <Topbar
          title={title}
          titleStyle={titleStyle}
          cancelText={cancelText}
          cancelStyle={cancelStyle}
          onCancel={cancel}
          confirmText={confirmText}
          confirmStyle={confirmStyle}
          onConfirm={confirm}
        />
        <View style={s.pickerContainer}>
          {data.map((columnData, columnIndex) => {
            return (
              <ScrollView
                key={columnIndex}
                style={columnIndex !== 0 ? s.scrollView : undefined}
                textStyle={textStyle}
                selectedIndex={innerSelectedIndexes[columnIndex]}
                data={columnData}
                onChange={(newIndex, record) => {
                  const newIndexes = [...innerSelectedIndexes];

                  newIndexes[columnIndex] = newIndex;

                  setInnerSelectIndexes(newIndexes);

                  if (onChange) {
                    onChange(
                      columnIndex,
                      record.value,
                      newIndex,
                      newIndexes.map(
                        (index, columnIndex) => data[columnIndex][index] && data[columnIndex][index].value,
                      ),
                      newIndexes,
                    );
                  }
                }}
              />
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "none",
  },
  containerVisible: {
    display: "flex",
  },
  panel: {
    position: "absolute",
    top: getWindowHeight(),
    left: 0,
    height: panelHeight,
    right: 0,
    backgroundColor: "#fff",
  },
  pickerContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflowX: "auto",
    paddingLeft: 10,
    paddingRight: 10,
  },
  scrollView: {
    marginLeft: 10,
  },
});
