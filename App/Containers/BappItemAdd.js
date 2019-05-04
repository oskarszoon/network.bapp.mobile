import React, { Component } from 'react';
import {
  SafeAreaView, ScrollView, Image,
} from 'react-native';
import { Transition } from 'react-navigation-fluid-transitions'
import ImagePicker from 'react-native-image-picker';
import RoundedButton from '../Components/RoundedButton';

import { Images } from '../Themes';

// Styles
import styles from './Styles/LaunchScreenStyles';
import { Card } from 'react-native-elements'
import FastImage from 'react-native-fast-image'

export default class BappItemAdd extends Component {
  constructor(props) {
    super(props);

    this.uploadImage = this.uploadImage.bind(this);
    this.submit = this.submit.bind(this);
  }

  uploadImage() {
    const options = {
      title: 'Select photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.uri };
        console.log('source', source);

        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };
      }
    });
  }

  submit() {
    const { navigation } = this.props;

    // TODO: save the stuff

    // Fake timeout
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  }

  render() {
    const { navigation } = this.props;
    const bapp = navigation.getParam('bapp');

    return (
      <SafeAreaView style={styles.mainContainer}>
        <Image source={Images.background} style={styles.backgroundImage} resizeMode="stretch" />
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
