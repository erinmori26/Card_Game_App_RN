import React from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Dimensions,
  Alert
} from "react-native";

import { AVAILABLE_CARDS } from "./data/availableCards";
import { Row } from "./components/Row";
import { Card } from "./components/Card";

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

  //   render() {
  //     return (
  //       <View style={styles.container}>
  //         <StatusBar barStyle="light-content" />
  //         <SafeAreaView style={styles.safearea}>
  //           {this.state.data.map((row, rowIndex) => (
  //             <Row key={row.name} index={rowIndex}>
  //               {row.columns.map((card, index) => {
  //                 const cardId = `${row.name}-${card.image}-${index}`; // unique ID for each card

  //                 return (
  //                   <Card
  //                     key={cardId}
  //                     index={index}
  //                     onPress={() => this.handleCardPress(cardId, card.image)} // handle when card is pressed
  //                     image={card.image}
  //                     isVisible={
  //                       // determined by selected cards and matching pairs
  //                       this.state.selectedIndices.includes(cardId) ||
  //                       this.state.matchedPairs.includes(card.image)
  //                     }
  //                   />
  //                 );
  //               })}
  //             </Row>
  //           ))}
  //         </SafeAreaView>
  //       </View>
  //     );
  //   }
  // }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safearea}>
          {/* See above where this.state.data is set (contains cards) */}
          {this.state.data.map((row, rowIndex) => (
            // Our ROW component
            <Row key={row.name} index={rowIndex}>
              {row.columns.map((card, index) => {
                // Unique id for each and every card
                const cardId = `${row.name}-${card.image}-${index}`;

                // Our CARD component
                return (
                  <Card
                    key={cardId}
                    index={index}
                    onPress={() => this.handleCardPress(cardId, card.image)}
                    image={card.image}
                    isVisible={
                      this.state.selectedIndices.includes(cardId) ||
                      this.state.matchedPairs.includes(card.image)
                    } // Set isVisible to true if card is included in selectedIndices or matchedPairs
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
