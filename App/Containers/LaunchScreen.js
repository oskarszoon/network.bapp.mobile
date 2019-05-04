import React, { Component } from 'react';
import {
  SafeAreaView, ScrollView, Image,
} from 'react-native';
import { Card } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import { Transition } from 'react-navigation-fluid-transitions';

import DevscreensButton from '../../ignite/DevScreens/DevscreensButton.js';
import RoundedButton from '../Components/RoundedButton';

import { Images } from '../Themes';

// Styles
import styles from './Styles/LaunchScreenStyles';

export default class LaunchScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bapps: [],
    };
  }

  componentDidMount() {
    fetch('http://localhost:9001/bapps/search/', {
      method: 'GET',
    }).then((response) => { return response.json(); })
      .then((response) => {
        this.setState({
          bapps: response.data,
        });
      });
  }

  openAddScreen(bapp) {
    const { navigation } = this.props;
    navigation.navigate('BappItemAdd', {
      bapp,
    });
  }

  render() {
    const { bapps = [] } = this.state;

    return (
      <SafeAreaView style={styles.mainContainer}>
        <Image source={Images.background} style={styles.backgroundImage} resizeMode="stretch" />
        <ScrollView style={styles.container}>
          {bapps.map((bapp) => {
            return (
              <Transition shared={`bapp-card-${bapp.txId}`}>
                <Card
                  key={bapp.txId}
                  title={bapp.name}
                >
                  <FastImage
                    style={{
                      width: '100%',
                      height: 80,
                    }}
                    source={{
                      uri: bapp.definition.logo,
                    }}
                  />
                  <RoundedButton onPress={this.openAddScreen.bind(this, bapp)}>Post</RoundedButton>
                </Card>
              </Transition>
            );
          })}
          <DevscreensButton />
        </ScrollView>
      </SafeAreaView>
    );
  }
}
