import React, { useRef, useEffect, useState, ReactNode } from "react";
import {
  View,
  Dimensions,
  Animated,
  StyleSheet,
  Easing,
  StyleProp,
  TextStyle,
  GestureResponderEvent,
  Text,
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

export interface IPickerProps {
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
  cancelText?: string;
  cancelStyle?: StyleProp<TextStyle>;
  confirmText?: string;
  confirmStyle?: StyleProp<TextStyle>;
  insertions?: (string | ReactNode)[][];
}

export interface IPickerViewProps<T> extends IPickerProps {
  onConfirm?: (values?: T[], indexes?: number[], records?: IData<T>[]) => void;
  onCancel?: () => void;
  onChange?: (columnIndex: number, value: T, index: number, values: T[], indexes: number[]) => void;
}

export interface IStoreProps<T> extends IPickerViewProps<T> {
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
    insertions = [],
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

  function renderInsertions(insertions?: (string | ReactNode)[]) {
    return insertions
      ? insertions.map((item, index) => {
          if (typeof item === "string") {
            return (
              <Text key={index} style={textStyle}>
                {item}
              </Text>
            );
          } else {
            return item;
          }
        })
      : null;
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

  const suffixElements = renderInsertions(insertions.slice(data.length));

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
            const prefix = insertions[columnIndex];
            const prefixElements = renderInsertions(prefix);

            return (
              <View key={columnIndex} style={[s.pickerColumn, columnIndex === 0 && { marginLeft: -10 }]}>
                {prefixElements && <View style={s.scrollView}>{prefixElements}</View>}
                <ScrollView
                  style={s.scrollView}
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
              </View>
            );
          })}
          {suffixElements && <View style={s.scrollView}>{suffixElements}</View>}
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
  pickerColumn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  scrollView: {
    marginLeft: 10,
  },
});
