import React, { Component } from 'react';
import {
  FlatList,
  SafeAreaView,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Transition } from 'react-navigation-fluid-transitions';
import { Card } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import ImageView from 'react-native-image-view';

import { Base64 } from 'js-base64';

const { width } = Dimensions.get('window');

// Styles
import styles from './Styles/LaunchScreenStyles';

export default class BappListItems extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],

      imageIndex: 0,
      isImageViewVisible: false,
    };
  }

  componentDidMount() {
    // TODO: retrieve from bappConfig
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
              '0864291665a5bec72395ead32c07cdea33de9f4333eba15aed0a41d1f5d7bdd0',
              '464548eb797d0404df1609f8d27e745dbfbbffbf779523d9d8d99653cf47771f',
              '44a47114d940ced383dc19aade16ce6ed2d83b15e87d06e0c9a831951405d4c0'
            ],
          },
        },
        skip: 0,
        limit: 100,
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
        console.log('response', response);
        this.setState({
          items: response.c || [],
        });
      });
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
    console.log('items', items);
    const { isImageViewVisible, imageIndex } = this.state;

    return (
      <SafeAreaView style={styles.mainContainer}>
        <Transition shared={`bapp-card-${bapp.txId}`} appear="scale">
          <Card
            key={bapp.txId}
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
        <View style={styles.list_container}>
          <FlatList
            data={items}
            renderItem={({ item, index }) => {
              // 16px padding, TODO: make this better
              const itemSize = ((width - 32) / 3);
              return (
                <TouchableOpacity
                  key={item.h}
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
            keyExtractor={(item, index) => { return index.h; }}
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
