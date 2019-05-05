import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import Mnemonic from 'bsv/mnemonic';
import Message from 'bsv/message';

const getSecureMnemonic = function () {
  // get mnemonic from secure storage
  /*
    const mnemonic = Mnemonic.fromRandom();
    console.log(mnemonic.toString());
  */

  const mnemonic = Mnemonic.fromString(
    'arm furnace brisk beyond luxury section expect slam lucky bread fever submit'
  );
  return mnemonic;
};

export const getLoginKey = function () {
  const mnemonic = getSecureMnemonic();
  const hdPrivateKey = mnemonic.toHDPrivateKey();
  return hdPrivateKey.deriveChild('m/0\'/0\'/0\'').privateKey;
};

export const login = function (callback) {
  const loginKey = getLoginKey();
  const address = loginKey.publicKey.toAddress().toString();
  const timestamp = Math.round(+new Date() / 1000);
  const selector = {
    address,
    timestamp,
  };

  Meteor.call('get-login-challenge', (err, challenge) => {
    if (err) {
      callback(err);
    } else {
      const signature = Message.sign(challenge + timestamp, loginKey);
      Meteor.loginWithBitcoin(selector, signature, callback);
    }
  });
};

Meteor.loginWithBitcoin = (selector, signature, callback) => {
  Accounts.callLoginMethod({
    methodArguments: [
      {
        address: selector.address,
        timestamp: selector.timestamp,
        challenge: selector.challenge,
        signature,
      }],
    userCallback: (error, userId) => {
      if (error) {
        if (callback) {
          callback(error);
        } else {
          throw error;
        }
      } else {
        callback && callback(null, userId);
      }
    },
  });
};
