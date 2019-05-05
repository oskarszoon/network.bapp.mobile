import React, { Component } from 'react';
import {
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import { Transition } from 'react-navigation-fluid-transitions';

import RoundedButton from '../Components/RoundedButton';
// Styles
import styles from './Styles/LaunchScreenStyles';

import coverPhoto from '../../assets/app_icon.png';

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
        <ActivityIndicator size="large" color="#e1f6f4" />
      </View>
    );
    if (bappsReady && creditsReady) {
      content = (
        <ScrollView style={styles.container}>
          {bapps.map((bapp) => {
            return (
              <View
                key={bapp.txId}
                style={styles.list_card}
              >
                <TouchableOpacity
                  onPress={this.openListScreen.bind(this, bapp)}
                  style={{ flex: 1 }}
                >
                  <View style={styles.list_card_content}>
                    <Transition shared={`bapp-logo-${bapp.txId}`}>
                      <FastImage
                        style={{
                          width: '100%',
                          height: 120,
                        }}
                        source={{
                          uri: bapp.definition.logo,
                        }}
                      />
                    </Transition>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}

          <Text style={styles.credits_text}>{`Bapp credits in your account: ${credits}`}</Text>
          <RoundedButton onPress={this.openBuyCredits}>Buy credits</RoundedButton>
        </ScrollView>
      );
    }

    return (
      <SafeAreaView style={styles.mainContainer}>
        <View style={{
          marginTop: 16,
          marginLeft: 16,
          flexDirection: 'row',
          flex: 0,
          alignItems: 'center',
        }}
        >
          <FastImage
            style={{
              width: 60,
              height: 60,
            }}
            source={coverPhoto}
          />
          <Text style={{
            fontSize: 40,
            color: '#e1f6f4',
          }}
          >
            Bapps
          </Text>
        </View>
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
