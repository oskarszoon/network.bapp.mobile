import React, { Component } from 'react';
import {
  SafeAreaView, ScrollView, ActivityIndicator, View, TouchableOpacity,
} from 'react-native';
import { Card } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import { Transition } from 'react-navigation-fluid-transitions';

// Styles
import styles from './Styles/LaunchScreenStyles';

export default class BappsList extends Component {
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
