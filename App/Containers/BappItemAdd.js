import React, { Component } from 'react';
import {
  SafeAreaView, ScrollView, Image,
} from 'react-native';
import { Transition } from 'react-navigation-fluid-transitions';
import ImagePicker from 'react-native-image-picker';
import { Card } from 'react-native-elements';
import FastImage from 'react-native-fast-image';

import RoundedButton from '../Components/RoundedButton';
import { submitBappTransaction } from '../Lib/bapp';

import { Images } from '../Themes';

// Styles
import styles from './Styles/LaunchScreenStyles';

export default class BappItemAdd extends Component {
  constructor(props) {
    super(props);

    this.uploadImage = this.uploadImage.bind(this);
    this.submit = this.submit.bind(this);

    this.state = {
      image: null,
    };
  }

  uploadImage() {
    const options = {
      title: 'Select photo',
      maxWidth: 300,
      maxHeight: 300,
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        // console.log('User cancelled image picker');
      } else if (response.error) {
        // console.log('ImagePicker Error: ', response.error);
      } else {
        this.setState({
          image: response,
        });
      }
    });
  }

  submit() {
    const { navigation } = this.props;

    // TODO: save the stuff
    const bapp = navigation.getParam('bapp');
    console.log('submitBappTransaction', bapp, this.state);
    submitBappTransaction(bapp, this.state, (err) => {
      if (err) {
        // TODO error handling
      } else {
        navigation.goBack();
      }
    });
  }

  render() {
    const { navigation } = this.props;
    const bapp = navigation.getParam('bapp');

    return (
      <SafeAreaView style={styles.mainContainer}>
        <Transition shared={`bapp-card-${bapp.txId}`} appear="scale">
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
          </Card>
        </Transition>
        <ScrollView style={styles.container}>
          <RoundedButton onPress={this.uploadImage}>
            Upload image
          </RoundedButton>
          <RoundedButton onPress={this.submit}>
            Submit
          </RoundedButton>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
