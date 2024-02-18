import React, { Fragment, useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Modal from 'react-native-modal';
import _ from 'lodash';

import { Die } from './dice';
import DeferedPromise from './deferedPromise';

const CRAP_OUT = `Crap Out!`;
const WINNER = `WINNER!!!`;
const SEVEN_OUT = `SEVEN OUT!`;
const GAME_NAME = `Baja Craps`;

let currentCount = 0;
let rollerOp = null;

const App = () => {
  const [randomCount, setRandomCount] = useState(7);
  const [rollDuration, setRollDuration] = useState(5 * 1000);
  // const [currentCount, setCurrentCount] = useState(0);
  const [point, setPoint] = useState(null);
  const [isFirstRoll, setIsFirstRoll] = useState(true);
  const [statusText, setStatusText] = useState(null);
  const [player, setPlayer] = useState(1);
  const [players, setPlayers] = useState([
    {
      name: `Player 1`,
      score: 0,
    },
    {
      name: `Player 2`,
      score: 0,
    },
  ]);
  const [winningPlayer, setWinningPlayer] = useState(null);
  const [dice1, setDice1] = useState(Math.floor(Math.random() * 6) + 1);
  const [dice2, setDice2] = useState(Math.floor(Math.random() * 6) + 1);
  const [rollTotal, setRollTotal] = useState('??');

  const diceRoller = useRef(new Animated.Value(0)).current;

  const resetGame = () => {
    setStatusText(null);
    setIsFirstRoll(true);
    setPoint(-1);
    setPlayer(1);
    setPlayers([
      {
        name: `player 1`,
        score: 0,
      },
      {
        name: `player 2`,
        score: 0,
      },
    ]);
    setWinningPlayer(null);
    setRollTotal('??');
    if(rollerOp) {
      clearInterval(rollerOp);
      rollerOp = null;
    }
  };

  const visualRoll = async () => {
    const dp = new DeferedPromise();
    if(rollerOp) {
      clearInterval(rollerOp);
    }
    rollerOp = setInterval(() => {
      console.log(`setInterval ran, currentCount: ${currentCount} randomCount: ${randomCount}`);
      if ((currentCount + 1) >= randomCount) {
        clearInterval(rollerOp);
        // setCurrentCount(0);
        currentCount = 0;
        dp.resolve();
      } else {
        setDice1(Math.floor(Math.random() * 6) + 1);
        setDice2(Math.floor(Math.random() * 6) + 1);
        // setCurrentCount(currentCount + 1);
        currentCount += 1;
      }
    }, 200);
    return dp;
  };

  const rollDice = async () => {
    // Initially, set the roll total to an indeterminate value
    setRollTotal('??');

    await visualRoll(); // Wait for the visual roll to complete

    const newDice1 = Math.floor(Math.random() * 6) + 1;
    const newDice2 = Math.floor(Math.random() * 6) + 1;
    const newRollTotal = newDice1 + newDice2;

    // Process the roll outcome
    if (isFirstRoll) {
      // Handle the first roll outcomes
      if (newRollTotal === 2 || newRollTotal === 3 || newRollTotal === 12) {
        setStatusText(CRAP_OUT);
        setIsFirstRoll(true); // Game logic might require adjusting this
        setPlayer(player === 1 ? 2 : 1); // Switch player
      } else if (newRollTotal === 7 || newRollTotal === 11) {
        scorePoint(); // Score the point for the player
        setStatusText(WINNER);
        setIsFirstRoll(true); // Reset for the next player
        setPoint(-1); // Reset the point
      } else {
        setStatusText(null);
        setIsFirstRoll(false); // Next roll won't be the first
        setPoint(newRollTotal); // Set the new point
      }
    } else {
      // Handle subsequent rolls
      if (newRollTotal === 7) {
        setStatusText(SEVEN_OUT);
        setIsFirstRoll(true); // Reset for the next player
        setPoint(-1); // Reset the point
        setPlayer(player === 1 ? 2 : 1); // Switch player
      } else if (point === newRollTotal) {
        scorePoint(); // Player scores a point
        setStatusText(WINNER);
        setIsFirstRoll(true); // Reset for the next player
        setPoint(-1); // Reset the point
      }
      // If none of the above conditions are met, the game continues without updating the status text
    }

    // Update the dice and roll total states with the new values
    setDice1(newDice1);
    setDice2(newDice2);
    setRollTotal(newRollTotal);
  };


  const scorePoint = () => {
    // Calculate player's turn (0-based index for array access)
    const playersTurn = player - 1;
    const currentPlayer = players[playersTurn];
    let newWinningPlayer = winningPlayer;

    const newPlayers = players.map((p, index) => {
      if (index === playersTurn) {
        // Increase score of the current player
        return { ...p, score: p.score + 1 };
      }
      return p;
    });

    // Determine the new winning player
    if (!newWinningPlayer) {
      newWinningPlayer = newPlayers[playersTurn];
    } else if (currentPlayer === newWinningPlayer || (newWinningPlayer && newWinningPlayer.score === 0)) {
      newWinningPlayer = newPlayers[playersTurn];
    } else {
      // Adjust scores if the current player is not winning
      newPlayers.forEach((p, index) => {
        if (p?.name === newWinningPlayer?.name) {
          const updatedScore = Math.max(p.score - 1, 0); // Ensure score doesn't go below 0
          newPlayers[index] = { ...p, score: updatedScore };
          // Update winning player if necessary
          if (updatedScore === 0) {
            newWinningPlayer = null;
          } else {
            newWinningPlayer = newPlayers[index];
          }
        }
      });
    }

    // Update state with new scores and potentially new winning player
    setPlayers(newPlayers);
    setWinningPlayer(newWinningPlayer);
  };


  const dismissModal = () => {
    setStatusText(null);
  };

  const renderModalContent = () => (
    <View style={styles.content}>
      <Text style={styles.contentTitle}>{statusText}</Text>
      {/* Modal close button logic */}
    </View>
  );

  return (
    <Fragment>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>

        <Text style={styles.gameName}>{GAME_NAME}</Text>

        <View style={{ backgroundColor: '#000', flexDirection: 'row' }}>
          <Die diceValue={dice1} />
          <Die diceValue={dice2} />
        </View>


        <Modal
          isVisible={!!statusText}
          backdropColor="#000"
          backdropOpacity={0.8}
          onBackdropPress={dismissModal}
          animationIn="zoomInDown"
          animationOut="zoomOutDown"
          animationInTiming={600}
          animationOutTiming={600}
          backdropTransitionInTiming={600}
          backdropTransitionOutTiming={600}
        >
          {renderModalContent()}
        </Modal>

        <View style={{ backgroundColor: '#000', flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 30 }}>
          {point > 0 &&
              <Text style={styles.pointText}>Point: {point}</Text>
            
          }
          {point <= 0 &&
            <Text style={styles.pointText}>No Point Yet.</Text>
          }

          <Text style={styles.rollText}>Roll: {rollTotal}</Text>
        </View>



        <Text style={styles.rollText}>Player's Turn: {players[player - 1].name}</Text>
        {winningPlayer && <Text style={styles.rollText}>Winning: {winningPlayer.name} - {winningPlayer.score}</Text>}
        {!winningPlayer && <Text style={styles.rollText}>No Leader Yet</Text>}

        <TouchableOpacity onPress={rollDice}>
          <Text style={styles.button}>ROLL</Text>
        </TouchableOpacity>

        <Button style={styles.button} title="RESET GAME" onPress={resetGame} />

      </SafeAreaView>
    </Fragment>
  );
};

// Styles remain the same
const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    color: 'white',
    backgroundColor: '#000',
  },
  gameName: {
    fontSize: 50,
    textAlign: 'center',
    color: 'white',
  },
  statusText: {
    fontSize: 50,
    textAlign: 'center',
    color: 'white',
  },
  pointText: {
    fontSize: 30,
    textAlign: 'center',
    color: 'white',
  },
  rollText: {
    fontSize: 30,
    textAlign: 'center',
    color: 'white',
  },
  button: {
    backgroundColor: 'gray',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 12,
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    overflow: 'hidden',
    padding: 12,
    textAlign: 'center'
  },
  content: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
});

export default App;
