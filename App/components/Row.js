import React from "react";
import { StyleSheet, Dimensions, Animated } from "react-native";

const screen = Dimensions.get("window");
const CARD_WIDTH = Math.floor(screen.width * 0.25);
const CARD_HEIGHT = Math.floor(CARD_WIDTH * (323 / 222));

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginVertical: 5
  }
});

// determine offset based on approx. row height
const getRowOffset = index => {
  switch (index) {
    case 0:
      return 1.5;
    case 1:
      return 0.5;
    case 2:
      return -0.5;
    case 3:
      return -1.5;
    default:
      return 0;
  }
};

export class Row extends React.Component {
  // set offset based on row index
  offset = new Animated.Value(CARD_HEIGHT * getRowOffset(this.props.index));

  opacity = new Animated.Value(0);

  componentDidMount() {
    // wait one second
    this.timeout = setTimeout(() => {
      // run two animations in parallel
      Animated.parallel([
        // animation movement takes 250 ms
        Animated.timing(this.offset, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        }),
        // fade in card for 100 ms
        Animated.timing(this.opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start(); // start animation
    }, 1000);
  }

  // clear timeout
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    const animationStyles = {
      opacity: this.opacity,
      transform: [
        {
          // move up/down into rows
          translateY: this.offset
        }
      ]
    };
    return (
      <Animated.View style={[styles.row, animationStyles]}>
        {this.props.children}
      </Animated.View>
    );
  }
}
