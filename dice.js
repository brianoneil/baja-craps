import React, { Fragment, Component } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    Image,
} from 'react-native';

const prefix = `perspective-`

const d1 = require(`./dice_assets/${prefix}dice-six-faces-one.png`),
    d2 = require(`./dice_assets/${prefix}dice-six-faces-two.png`),
    d3 = require(`./dice_assets/${prefix}dice-six-faces-three.png`),
    d4 = require(`./dice_assets/${prefix}dice-six-faces-four.png`),
    d5 = require(`./dice_assets/${prefix}dice-six-faces-five.png`),
    d6 = require(`./dice_assets/${prefix}dice-six-faces-six.png`);

const dice = [d1, d2, d3, d4, d5, d6];


class Die extends Component {


    render() {
        return (
            <View style={styles.dieView}>
                {/* <Text style={styles.dieText}>{this.props.diceValue}</Text> */}
                <Image style={styles.dieImage} source={dice[this.props.diceValue - 1]} />
            </View>
        )
    }
}

module.exports = {
    Die
}

const styles = StyleSheet.create({

    dieView: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        borderRadius: 20,
        borderColor: 'black',
        backgroundColor: '#003338',
        width: 100,
        height: 100,
    },
    dieText: {
        color: 'white',
        fontSize: 50,
        textAlign: 'center',
    },
    dieImage: {
        height: 120,
        width: 120,
    }

});