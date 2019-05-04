import React, { Component } from 'react';
import {
  SafeAreaView, ScrollView, Image, Text,
} from 'react-native';
import RoundedButton from '../Components/RoundedButton';

import { Images } from '../Themes';

// Styles
import styles from './Styles/LaunchScreenStyles';

export default class BappItemAdd extends Component {
  constructor(props) {
    super(props);

    this.submit = this.submit.bind(this);
  }

  submit() {
    // TODO: save the stuff

    const { navigation } = this.props;
    navigation.goBack();
  }

  render() {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <Text>Bapp item add</Text>
        <Image source={Images.background} style={styles.backgroundImage} resizeMode="stretch" />
        <ScrollView style={styles.container}>
          <RoundedButton onPress={this.submit}>
            Submit
          </RoundedButton>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
