import React, { Component } from 'react';
import {
  FlatList,
  SafeAreaView,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Transition } from 'react-navigation-fluid-transitions';
import { HeaderBackButton } from 'react-navigation';
import FastImage from 'react-native-fast-image';
import ImageView from 'react-native-image-view';
import { Base64 } from 'js-base64';

import { isAndroid } from '../Lib/platform';
import RoundedButton from '../Components/RoundedButton'
// Styles
import styles from './Styles/LaunchScreenStyles';

const { width } = Dimensions.get('window');

export default class BappListItems extends Component {
  constructor(props) {
    super(props);

    this.openAddScreen = this.openAddScreen.bind(this);
    this.goBack = this.goBack.bind(this);

    this.state = {
      items: [],

      imageIndex: 0,
      isImageViewVisible: false,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;

    const bapp = navigation.getParam('bapp');

    // TODO: retrieve from bappConfig
    if (bapp.txId === 'ba84be7e9e44dd1fa0ce9f85bf6e22265ba056f35dc23817883cff33af1f5f96') {
      // Bitstagram
      const query = {
        v: 3,
        q: {
          find: {
            'tx.h': {
              $nin: [
                '2ac1586cbdfa760b3a06fba737c46d15366152b6e1bab82075626e95732d0b70',
                '244f5d97018f9c84f2828456c122d3d10092b42c58a6271a3b6b4cbfbf79db77',
                '355baf48b70bfd4d900391ee579b9ba1f5c5eb55b87dcb49cad88c0996f3bfc0',
                '3bb441fed7a2cf04f962ba4cf9ed2c258137bfcb841ea25e48b52b70662dacbb',
                '6b9bf18f86045495251ffbf46deca0ba11e7efb059a6dd41b7af2dd66ce6505f',
                '23ebe216c10a102080c3906155d46ee47e4204a60917c24c6ceb0cb5eca2b45b',
                '0864291665a5bec72395  ead32c07cdea33de9f4333eba15aed0a41d1f5d7bdd0',
                '464548eb797d0404df1609f8d27e745dbfbbffbf779523d9d8d99653cf47771f',
                '44a47114d940ced383dc19aade16ce6ed2d83b15e87d06e0c9a831951405d4c0',
              ],
            },
          },
          skip: 0,
          limit: 99,
        },
        r: { f: '[ .[] | {h: .tx.h, in: .in, blk: .blk} ]' },
      };

      const bitstagramUrl = `https://lol.bitdb.network/q/1BvPxwDoz6DR9qedZrKJjWio6Gm7UCPGXU/${Base64.encode(JSON.stringify(query))}`;
      fetch(bitstagramUrl, {
        headers: {
          key: '1KJPjd3p8khnWZTkjhDYnywLB2yE1w5BmU',
        },
      }).then((response) => { return response.json(); })
        .then((response) => {
          this.setState({
            items: response.c || [],
          });
        });
    }
  }

  openAddScreen() {
    const { navigation } = this.props;
    const bapp = navigation.getParam('bapp');
    navigation.navigate('BappItemAdd', {
      bapp,
    });
  }

  goBack() {
    const { navigation } = this.props;
    navigation.goBack();
  }

  render() {
    const { navigation } = this.props;
    const bapp = navigation.getParam('bapp');

    const { items } = this.state;

    const images = items.map((item) => {
      return {
        source: {
          uri: `https://bico.media/${item.h}`,
        },
      };
    });
    const { isImageViewVisible, imageIndex } = this.state;

    return (
      <SafeAreaView style={styles.listItems_container}>
        <View style={{ flexDirection: 'row' }}>
          <HeaderBackButton
            tintColor="#166678"
            onPress={this.goBack}
          />
        </View>
        <View style={styles.list_container}>
          <FlatList
            data={items}
            ListHeaderComponent={(
              <View>
                <Transition shared={`bapp-logo-${bapp.txId}${isAndroid ? 'item-skip' : ''}`}>
                  <FastImage
                    style={{
                      width: '100%',
                      height: 240,
                    }}
                    source={{
                      uri: bapp.definition.logo,
                    }}
                  />
                </Transition>
                <RoundedButton onPress={this.openAddScreen}>Post</RoundedButton>
              </View>
            )}
            renderItem={({ item, index }) => {
              // 16px padding, TODO: make this better
              const itemSize = ((width - 32) / 3);
              return (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      imageIndex: index,
                      isImageViewVisible: true,
                    });
                  }}
                >
                  <FastImage
                    style={{ width: itemSize, height: itemSize }}
                    source={images[index].source}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              );
            }}
            numColumns={3}
            keyExtractor={(item) => { return item.h; }}
          />
        </View>
        <ImageView
          glideAlways
          images={images}
          imageIndex={imageIndex}
          animationType="fade"
          isVisible={isImageViewVisible}
          onClose={() => this.setState({isImageViewVisible: false})}
        />
      </SafeAreaView>
    );
  }
}
