import React from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
  Animated
} from "react-native";

import { AVAILABLE_CARDS } from "./data/availableCards";

const screen = Dimensions.get("window");
const CARD_WIDTH = Math.floor(screen.width * 0.25);
const CARD_HEIGHT = Math.floor(CARD_WIDTH * (323 / 222));

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#7CB48F",
    flex: 1
  },
  safearea: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginVertical: 10
  },
  card: {
    backgroundColor: "#fff",
    borderColor: "#fff",
    borderWidth: 5,
    borderRadius: 3
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT
  }
});

// get column offset based on column index
const getColumnOffset = index => {
  switch (index) {
    case 0:
      return 1.2;
    case 1:
      return 0;
    case 2:
      return -1.2;
    default:
      return 0;
  }
};

class Card extends React.Component {
  offset = new Animated.Value(CARD_WIDTH * getColumnOffset(this.props.index));

  componentDidMount() {
    // wait one second
    this.timeout = setTimeout(() => {
      Animated.timing(this.offset, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      }).start();
    }, 1000);
  }

  // clear timeout
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  // get and display proper card image
  render() {
    const { onPress, image, isVisible } = this.props;
    let displayImage = (
      <Image source={image} style={styles.cardImage} resizeMode="contain" />
    );

    // show back if not visible
    if (!isVisible) {
      displayImage = (
        <Image
          source={require("./assets/card-back.png")}
          style={styles.cardImage}
          resizeMode="contain"
        />
      );
    }

    const animatedStyles = {
      transform: [
        {
          // move left/right into columns
          translateX: this.offset
        }
      ]
    };

    return (
      <TouchableOpacity onPress={onPress}>
        <Animated.View style={[styles.card, animatedStyles]}>
          {displayImage}
        </Animated.View>
      </TouchableOpacity>
    );
  }
}

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

class Row extends React.Component {
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

const initialState = {
  data: [],
  moveCount: 0,
  selectedIndices: [], // array of selected indices (know which to mark isVisible)
  currentImage: null,
  matchedPairs: []
};

class App extends React.Component {
  state = initialState;

  componentDidMount() {
    this.draw(); // draw cards (start)
  }

  componentDidUpdate() {
    if (this.state.matchedPairs.length >= 6) {
      this.gameComplete(); // game done when all matches found
    }
  }

  // alert when game complete
  gameComplete = () => {
    Alert.alert(
      "Winner!",
      `You completed the puzzle in ${this.state.moveCount} moves!`,
      [
        {
          // reset game (initial state and re-draw cards)
          text: "Reset Game",
          onPress: () => this.setState({ ...initialState }, () => this.draw())
        }
      ]
    );
  };

  draw = () => {
    const possibleCards = [...AVAILABLE_CARDS];
    const selectedCards = [];

    // 12 cards in play
    for (let i = 0; i < 6; i += 1) {
      // get random cards
      const randomIndex = Math.floor(Math.random() * possibleCards.length);
      const card = possibleCards[randomIndex];

      // push two instances of same card
      selectedCards.push(card);
      selectedCards.push(card);

      // remove selected cards from available cards
      possibleCards.splice(randomIndex, 1);
    }

    // randomize array
    selectedCards.sort(() => 0.5 - Math.random());

    const cardRow = [];
    const columnSize = 3;
    let index = 0;

    // create four rows of three cards
    while (index < selectedCards.length) {
      cardRow.push(selectedCards.slice(index, columnSize + index));
      index += columnSize;
    }

    // show images of cards
    const data = cardRow.map((row, i) => {
      return {
        name: i,
        columns: row.map(image => ({ image }))
      };
    });

    this.setState({ data });
  };

  handleCardPress = (cardId, image) => {
    let callWithUserParams = false;
    this.setState(
      ({ selectedIndices, currentImage, matchedPairs, moveCount }) => {
        const nextState = {};

        // user can only choose two cards at a time
        if (selectedIndices.length > 1) {
          callWithUserParams = true; // recur below
          return { selectedIndices: [] };
        }

        // increment number of moves
        nextState.moveCount = moveCount + 1;

        // if selected card matches current image
        if (selectedIndices.length === 1) {
          // check match and make sure user can't press same selected card to find match
          if (image === currentImage && !selectedIndices.includes(cardId)) {
            nextState.currentImage = null;
            nextState.matchedPairs = [...matchedPairs, image]; // add to matchedPairs list
          }
        } else {
          nextState.currentImage = image;
        }

        // build on selected cards
        nextState.selectedIndices = [...selectedIndices, cardId];

        return nextState;
      },
      () => {
        // recur: call function again with currently inputted values (selected cards)
        // no useless clicks to clear selected cards
        if (callWithUserParams) {
          this.handleCardPress(cardId, image);
        }
      }
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safearea}>
          {this.state.data.map((row, rowIndex) => (
            <Row key={row.name} index={rowIndex}>
              {row.columns.map((card, index) => {
                const cardId = `${row.name}-${card.image}-${index}`; // unique ID for each card

                return (
                  <Card
                    key={cardId}
                    index={index}
                    onPress={() => this.handleCardPress(cardId, card.image)} // handle when card is pressed
                    image={card.image}
                    isVisible={
                      // determined by selected cards and matching pairs
                      this.state.selectedIndices.includes(cardId) ||
                      this.state.matchedPairs.includes(card.image)
                    }
                  />
                );
              })}
            </Row>
          ))}
        </SafeAreaView>
      </View>
    );
  }
}

export default App;
