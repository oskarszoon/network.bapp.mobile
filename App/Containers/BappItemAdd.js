import React, { Component } from 'react';
import {
  View, SafeAreaView, ScrollView, ActivityIndicator,
} from 'react-native';
import RNFS from 'react-native-fs';
import { Transition } from 'react-navigation-fluid-transitions';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import FastImage from 'react-native-fast-image';
import { HeaderBackButton } from 'react-navigation';
import { Input } from 'react-native-elements';

import { isAndroid } from '../Lib/platform';
import RoundedButton from '../Components/RoundedButton';
import { submitBappTransaction } from '../Lib/bapp';

// Styles
import styles from './Styles/LaunchScreenStyles';

export default class BappItemAdd extends Component {
  constructor(props) {
    super(props);

    this.submit = this.submit.bind(this);
    this.cancel = this.cancel.bind(this);
    this.goBack = this.goBack.bind(this);
    this.renderImageField = this.renderImageField.bind(this);
    this.renderTextField = this.renderTextField.bind(this);

    this.state = {
      image: null,
      uploading: false,
    };
  }

  submit() {
    const { navigation } = this.props;

    this.setState({
      uploading: true,
    });

    const bapp = navigation.getParam('bapp');
    const { inputFields } = bapp.definition;

    const transactionValues = inputFields.map((inputField) => {
      return this.state[inputField.id];
    });
    submitBappTransaction(bapp, transactionValues, (err) => {
      this.setState({
        uploading: false,
      });
      if (err) {
        // TODO error handling
        console.error(err);
      } else {
        navigation.goBack();
      }
    });
  }

  goBack() {
    const { navigation } = this.props;
    navigation.goBack();
  }

  cancel(fieldId) {
    this.setState({
      [fieldId]: null,
    });
  }

  uploadImage(fieldId) {
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
              [fieldId]: response,
            });
          });
        }).catch((err) => {
          console.error(err);
        });
      }
    });
  }

  renderImageField(inputField) {
    const { id } = inputField;
    const { uploading } = this.state;

    const selectImage = (
      <RoundedButton onPress={this.uploadImage.bind(this, id)}>
        Select image
      </RoundedButton>
    );

    if (this.state[id]) {
      const image = this.state[id];
      return (
        <View>
          <View>
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
          {!uploading && (
            <View>
              <RoundedButton onPress={this.cancel.bind(this, id)}>
                Cancel
              </RoundedButton>
            </View>
          )}
        </View>
      );
    }
    return selectImage;
  }

  handleChangeInput(fieldId, value) {
    this.setState({
      [fieldId]: value,
    });
  }

  renderTextField(inputField) {
    const { id, description } = inputField;

    return (
      <Input
        containerStyle={styles.text_field_input_container}
        inputContainerStyle={styles.text_field_input}
        onChangeText={this.handleChangeInput.bind(this, id)}
        placeholder={description}
      />
    );
  }

  render() {
    const { navigation } = this.props;
    const { uploading } = this.state;
    const bapp = navigation.getParam('bapp');

    const { inputFields } = bapp.definition;

    const inputFieldContents = [];
    let requiredInputsReady = false;
    inputFields.forEach((inputField) => {
      if (inputField.type === 'image') {
        inputFieldContents.push(this.renderImageField(inputField));
      } else if (inputField.type === 'text') {
        inputFieldContents.push(this.renderTextField(inputField));
      } else {
        // inputFieldContents.push((
        //   <Text>Dont know how to render yet</Text>
        // ));
      }

      if (inputField.required && this.state[inputField.id]) {
        requiredInputsReady = true;
      }
    });

    return (
      <SafeAreaView style={styles.mainContainer}>
        <HeaderBackButton
          tintColor="#ffffff"
          onPress={this.goBack}
        />
        <View style={styles.list_card}>
          <View style={styles.list_card_content}>
            <Transition shared={`bapp-logo-${bapp.txId}${isAndroid ? 'add-skip' : ''}`}>
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
        </View>
        <ScrollView style={styles.container}>
          {inputFieldContents.map((inputField, index) => {
            return (
              <View
                key={index.toString()}
                style={styles.input_field_container}
              >
                {inputField}
              </View>
            );
          })}
          {requiredInputsReady && !uploading && (
            <RoundedButton onPress={this.submit}>
              Submit to blockchain
            </RoundedButton>
          )}
        </ScrollView>
        {uploading && (
          <View style={styles.loading_container}>
            <ActivityIndicator size="large" color="#abadb1" />
          </View>
        )}
      </SafeAreaView>
    );
  }
}
