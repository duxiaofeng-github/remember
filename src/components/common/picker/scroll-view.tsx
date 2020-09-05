import React from "react";
import {
  View,
  StyleSheet,
  Text,
  Animated,
  GestureResponderEvent,
  Easing,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

type IData<T> = {key?: string; label: string; value: T};

interface IProps<T> {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  selectedIndex?: number;
  data: IData<T>[];
  onChange: (index: number, record: IData<T>) => void;
}

interface IState {
  topValue: Animated.Value;
}

const itemHeight = 30;
const itemCount = 5;
const indicatorUpperBounce = ((itemCount - 1) / 2) * itemHeight;

export class ScrollView<T> extends React.Component<IProps<T>, IState> {
  originY = 0;
  originTop = 0;
  prevTop = 0;
  distance = 0;
  containerHeight = 0;
  innerHeight = 0;

  constructor(props: IProps<T>) {
    super(props);

    this.state = {
      topValue: new Animated.Value(0),
    };
  }

  componentDidMount() {
    const {selectedIndex = 0, data} = this.props;
    const top = getTopByIndex(selectedIndex);

    this.innerHeight = data.length * itemHeight;
    this.autoRollToTop(top);
  }

  componentDidUpdate(prevProps: IProps<T>) {
    if (prevProps.data !== this.props.data) {
      this.innerHeight = this.props.data.length * itemHeight;
    }

    if (prevProps.selectedIndex !== this.props.selectedIndex) {
      const top = getTopByIndex(this.props.selectedIndex || 0);

      this.autoRollToTop(top);
    }
  }

  render() {
    const {style, textStyle} = this.props;

    return (
      <View
        style={[s.container, style]}
        onLayout={(e) => {
          const {height} = e.nativeEvent.layout;

          this.containerHeight = height;
        }}>
        <Animated.View
          style={[s.inner, {transform: [{translateY: this.state.topValue}]}]}
          onTouchStart={this.touchStart}
          onTouchMove={this.touchMove}
          onTouchEnd={this.touchEnd}>
          {this.props.data.map((item) => {
            return (
              <View key={item.key || item.label} style={s.item}>
                <Text style={textStyle}>{item.label}</Text>
              </View>
            );
          })}
        </Animated.View>
        <View style={s.indicator} pointerEvents="none" />
      </View>
    );
  }

  touchStart = (e: GestureResponderEvent) => {
    const touch = e.nativeEvent.touches[0];
    this.originY = touch.pageY;
    this.originTop = this.prevTop;
  };

  touchMove = (e: GestureResponderEvent) => {
    const touch = e.nativeEvent.touches[0];

    this.distance = touch.pageY - this.originY;

    let top = this.originTop + this.distance;
    const bottom = this.containerHeight - (this.innerHeight + top);

    if (top > indicatorUpperBounce + 1) {
      top = 10 / top + this.prevTop;
    } else if (bottom > indicatorUpperBounce + 1) {
      top = this.prevTop - 10 / bottom;
    }

    this.prevTop = top;

    Animated.timing(this.state.topValue, {
      toValue: top,
      duration: 0,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  touchEnd = () => {
    const top = this.originTop + this.distance;
    const bottom = this.containerHeight - (this.innerHeight + top);
    let toTop = 0;

    if (top > indicatorUpperBounce) {
      toTop = indicatorUpperBounce;
      this.onSelect(0);
    } else if (bottom > indicatorUpperBounce) {
      toTop = -(this.innerHeight - this.containerHeight) - indicatorUpperBounce;
      this.onSelect(this.props.data.length - 1);
    } else {
      const offsetTop = -(top - indicatorUpperBounce);
      const offsetItemIndex = Math.round(offsetTop / itemHeight);
      toTop = -(offsetItemIndex * itemHeight) + indicatorUpperBounce;
      this.onSelect(offsetItemIndex);
    }

    this.autoRollToTop(toTop);
  };

  onSelect(index: number) {
    this.props.onChange(index, this.props.data[index]);
  }

  autoRollToTop(top: number) {
    this.prevTop = top;

    Animated.timing(this.state.topValue, {
      toValue: top,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }
}

function getTopByIndex(index: number) {
  return indicatorUpperBounce - index * itemHeight;
}

const s = StyleSheet.create({
  container: {
    position: "relative",
    height: itemHeight * itemCount,
    paddingLeft: 5,
    paddingRight: 5,
    overflow: "hidden",
  },
  inner: {
    width: "100%",
  },
  item: {
    height: itemHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    position: "absolute",
    left: 0,
    right: 0,
    top: indicatorUpperBounce,
    height: itemHeight,
    borderTopColor: "#2b8bda",
    borderTopWidth: 1,
    borderBottomColor: "#2b8bda",
    borderBottomWidth: 1,
  },
});
