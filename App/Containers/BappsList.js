import React, { Component } from 'react';
import {
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Card, Overlay } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import { Transition } from 'react-navigation-fluid-transitions';

import RoundedButton from '../Components/RoundedButton';
// Styles
import styles from './Styles/LaunchScreenStyles';

import coverPhoto from '../../assets/generator/facebook_cover_photo_2.png';

export default class BappsList extends Component {
  constructor(props) {
    super(props);

    this.openBuyCredits = this.openBuyCredits.bind(this);
    this.buyCredits = this.buyCredits.bind(this);

    this.state = {
      bappsReady: false,
      creditsReady: false,
      credits: 0,
      bapps: [],
      buyCreditsVisible: false,
    };
  }

  componentDidMount() {
    Meteor.call('bapps/search', '', (err, bapps) => {
      this.setState({
        bappsReady: true,
        bapps,
      });
    });
    Meteor.call('credits/get', '', (err, credits) => {
      this.setState({
        creditsReady: true,
        credits,
      });
    });
  }

  openListScreen(bapp) {
    const { navigation } = this.props;
    navigation.navigate('BappListItems', {
      bapp,
    });
  }

  openBuyCredits() {
    this.setState({
      buyCreditsVisible: true,
    });
  }

  buyCredits() {
    this.setState({
      creditsReady: false,
      buyCreditsVisible: false,
    });
    Meteor.call('credits/add', 500, (err, credits = 0) => {
      if (err) {
        console.error(err);
      }
      this.setState({
        creditsReady: true,
        credits,
      });
    });
  }

  render() {
    const {
      bapps,
      bappsReady,
      creditsReady,
      credits,
      buyCreditsVisible,
    } = this.state;

    let content = (
      <View style={styles.loading_container}>
        <ActivityIndicator size="large" color="#abadb1" />
      </View>
    );
    if (bappsReady && creditsReady) {
      content = (
        <ScrollView style={styles.container}>
          <FastImage
            style={{
              width: '100%',
              height: 120,
            }}
            source={coverPhoto}
          />
          {bapps.map((bapp) => {
            return (
              <TouchableOpacity
                key={bapp.txId}
                onPress={this.openListScreen.bind(this, bapp)}
              >
                <Card style={styles.list_card}>
                  <Transition shared={`bapp-logo-${bapp.txId}`}>
                    <FastImage
                      style={{
                        width: '100%',
                        height: 160,
                      }}
                      source={{
                        uri: bapp.definition.logo,
                      }}
                    />
                  </Transition>
                </Card>
              </TouchableOpacity>
            );
          })}

          <Text style={styles.credits_text}>{`Bapp credits in your account: ${credits}`}</Text>
          <RoundedButton onPress={this.openBuyCredits}>Buy credits</RoundedButton>
        </ScrollView>
      );
    }

    return (
      <SafeAreaView style={styles.mainContainer}>
        {content}
        <Overlay
          isVisible={buyCreditsVisible}
          onBackdropPress={() => {
            this.setState({
              buyCreditsVisible: false,
            });
          }}
          windowBackgroundColor="rgba(0, 0, 0, .5)"
          overlayBackgroundColor="white"
          width="auto"
          height="auto"
        >
          <View style={{ padding: 16 }}>
            <Text style={{ marginBottom: 16 }}>
              We haven't implemented payments through the app stores yet, lucky you.
            </Text>
            <RoundedButton onPress={this.buyCredits}>Get free bapp credits</RoundedButton>
          </View>
        </Overlay>
      </SafeAreaView>
    );
  }
}
