import React, { Component } from 'react';
import {
  SafeAreaView, ScrollView, ActivityIndicator, View,
} from 'react-native';
import { Card } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import { Transition } from 'react-navigation-fluid-transitions';

import DevscreensButton from '../../ignite/DevScreens/DevscreensButton.js';
import RoundedButton from '../Components/RoundedButton';

// Styles
import styles from './Styles/LaunchScreenStyles';

export default class LaunchScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      bapps: [],
    };
  }

  componentDidMount() {
    Meteor.call('bapps/search', '', (err, bapps) => {
      this.setState({
        loading: false,
        bapps,
      });
    });
  }

  openListScreen(bapp) {
    const { navigation } = this.props;
    navigation.navigate('BappListItems', {
      bapp,
    });
  }

  openAddScreen(bapp) {
    const { navigation } = this.props;
    navigation.navigate('BappItemAdd', {
      bapp,
    });
  }

  render() {
    const { bapps, loading } = this.state;

    let content = (
      <View style={styles.loading_container}>
        <ActivityIndicator size="large" color="#abadb1" />
      </View>
    );
    if (!loading) {
      content = (
        <ScrollView style={styles.container}>
          {bapps.map((bapp) => {
            return (
              <Transition
                key={bapp.txId}
                shared={`bapp-card-${bapp.txId}`}
              >
                <Card title={bapp.name}>
                  <FastImage
                    style={{
                      width: '100%',
                      height: 80,
                    }}
                    source={{
                      uri: bapp.definition.logo,
                    }}
                  />
                  <RoundedButton onPress={this.openListScreen.bind(this, bapp)}>Open</RoundedButton>
                  <RoundedButton onPress={this.openAddScreen.bind(this, bapp)}>Post</RoundedButton>
                </Card>
              </Transition>
            );
          })}
          <DevscreensButton />
        </ScrollView>
      );
    }

    return (
      <SafeAreaView style={styles.mainContainer}>
        {content}
      </SafeAreaView>
    );
  }
}
