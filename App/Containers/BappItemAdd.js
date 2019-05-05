import React, { Component } from 'react';
import {
  View, SafeAreaView, ScrollView, Platform, ActivityIndicator,
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
    this.cancel = this.cancel.bind(this);

    this.state = {
      image: null,
      uploading: false,
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
        ImageResizer.createResizedImage(response.uri, 320, 320, 'JPEG', 60).then(({ uri }) => {
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

  cancel () {
    this.setState({
      image: null,
    });
  }

  submit () {
    const { navigation } = this.props;

    this.setState({
      uploading: true,
    });

    // TODO: save the stuff
    const bapp = navigation.getParam('bapp');
    submitBappTransaction(bapp, this.state, (err) => {
      if (err) {
        // TODO error handling
        this.setState({
          uploading: false,
        });
        console.error(err);
      } else {
        navigation.goBack();
      }
    });
  }

  render () {
    const { navigation } = this.props;
    const { image, uploading } = this.state;
    const bapp = navigation.getParam('bapp');

    const selectImage = (
      <RoundedButton onPress={this.uploadImage}>
        Select image
      </RoundedButton>
    );

    let content;
    if (image) {
      const uploadButtons = (
        <View>
          <RoundedButton onPress={this.submit}>
            Submit
          </RoundedButton>
          <RoundedButton onPress={this.cancel}>
          Cancel
          </RoundedButton>
        </View>
      );
      const uploadingIndicator = (
        <View style={styles.loading_container}>
          <ActivityIndicator size="large" color="#abadb1" />
        </View>
      );
      content = (
        <View>
          <View
            style={{
              padding: 16,
            }}
          >
            <FastImage
              style={{
                width: '100%',
                height: 160,
              }}
              source={{
                uri: image.uri,
              }}
            />
          </View>
          {uploading ? uploadingIndicator : uploadButtons}
        </View>
      );
    } else {
      content = selectImage;
    }

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
          {content}
        </ScrollView>
      </SafeAreaView>
    );
  }
}
