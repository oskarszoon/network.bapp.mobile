import React, { Component } from 'react';
import {
  SafeAreaView, ActivityIndicator, View,
} from 'react-native';

// Styles
import styles from './Styles/LaunchScreenStyles';

export default class LaunchScreen extends Component {
  componentDidMount() {
    const { ready, navigation } = this.props;
    if (ready) {
      navigation.navigate('App');
    }
  }

  componentDidUpdate() {
    const { ready, navigation } = this.props;
    if (ready) {
      navigation.navigate('App');
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.loading_container}>
          <ActivityIndicator size="large" color="#e1f6f4" />
        </View>
      </SafeAreaView>
    );
  }
}
