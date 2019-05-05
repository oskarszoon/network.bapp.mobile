import React, { Component } from 'react';
import {
  SafeAreaView, ScrollView, Platform,
} from 'react-native';
import RNFS from 'react-native-fs';
import { Transition } from 'react-navigation-fluid-transitions';
import ImagePicker from 'react-native-image-picker';
import ImageResizerIos from 'react-native-image-resizer/index.ios';
import ImageResizerAndroid from 'react-native-image-resizer/index.android';
import { Card } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import { HeaderBackButton } from 'react-navigation'

import RoundedButton from '../Components/RoundedButton';
import { submitBappTransaction } from '../Lib/bapp';

// Styles
import styles from './Styles/LaunchScreenStyles';

// this should really be handled by the react plugin :-S
const ImageResizer = Platform.OS === 'android' ? ImageResizerAndroid : ImageResizerIos;

export default class BappItemAdd extends Component {
  constructor(props) {
    super(props);

    this.uploadImage = this.uploadImage.bind(this);
    this.submit = this.submit.bind(this);

    this.state = {
    };
  }

  uploadImage () {
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
        ImageResizer.createResizedImage(response.uri, 480, 480, 'JPEG', 60).then(({ uri }) => {
          RNFS.readFile(uri, 'base64').then((data) => {
            response.uri = uri;
            response.data = data;
            this.setState({
              image: response,
            });
          });
        }).catch((err) => {
          console.error(err);
        });
      }
    });
  }

  submit () {
    const { navigation } = this.props;

    // TODO: save the stuff
    const bapp = navigation.getParam('bapp');
    console.log('submitBappTransaction', bapp, this.state);
    submitBappTransaction(bapp, this.state, (err) => {
      if (err) {
        // TODO error handling
        console.error(err);
      } else {
        navigation.goBack();
      }
    });
  }

  render () {
    const { navigation } = this.props;
    const bapp = navigation.getParam('bapp');

    return (
      <SafeAreaView style={styles.mainContainer}>
        <HeaderBackButton
          tintColor="#ffffff"
          onPress={navigation.goBack}
        />
        <Card style={styles.list_card}>
          <Transition shared={`bapp-logo-${bapp.txId}`} appear="scale">
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
