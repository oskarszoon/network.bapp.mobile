import React, { Component } from 'react';
import { SafeAreaView, ScrollView, Image } from 'react-native';
import DevscreensButton from '../../ignite/DevScreens/DevscreensButton.js';
import RoundedButton from '../Components/RoundedButton';

import { Images } from '../Themes';

// Styles
import styles from './Styles/LaunchScreenStyles';

export default class LaunchScreen extends Component {
  constructor(props) {
    super(props);

    this.openAddScreen = this.openAddScreen.bind(this);
  }

  openAddScreen() {
    const { navigation } = this.props;
    navigation.navigate('BappItemAdd', {
      bappId: 'bitstagram',
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <Image source={Images.background} style={styles.backgroundImage} resizeMode="stretch" />
        <ScrollView style={styles.container}>
          <RoundedButton onPress={this.openAddScreen}>
            Bitstagram
          </RoundedButton>

          <DevscreensButton />
        </ScrollView>
      </SafeAreaView>
    );
  }
}
