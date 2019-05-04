import React, { Component } from 'react';
import {
  SafeAreaView, ScrollView, Image, Text,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import RoundedButton from '../Components/RoundedButton';

import { Images } from '../Themes';

// Styles
import styles from './Styles/LaunchScreenStyles';

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
        <Text>{bapp.name}</Text>
        <Text>Bapp item add</Text>
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
