import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import Message from 'bsv/message';
import Mnemonic from 'bsv/mnemonic';
import { getMnemonic, generateNewMnemonic } from './secure-store';

const getHdPrivateKey = async function () {
  const mnemonicString = await getMnemonic();
  const mnemonic = Mnemonic.fromString(mnemonicString);
  return mnemonic.toHDPrivateKey();
};

export const getLoginKey = async function () {
  const hdPrivateKey = await getHdPrivateKey();
  return hdPrivateKey.deriveChild('m/0\'/0\'/0\'').privateKey;
};

export const getSigningKey = async function () {
  const hdPrivateKey = await getHdPrivateKey();
  return hdPrivateKey.deriveChild('m/0/0/0').privateKey;
};

export const checkOrCreateKeys = async function () {
  let mnemonic = await getMnemonic();
  if (!mnemonic) {
    mnemonic = await generateNewMnemonic();
  }

  return !!mnemonic;
};

const createUserAndLogin = async function (loginKey, selector, challenge) {
  const createChallenge = `Create new user ${selector.address} ${selector.timestamp}`;
  const signature = Message.sign(createChallenge, loginKey);
  Meteor.call('create-user', selector.address, selector.timestamp, signature, (err) => {
    if (err) {
      callback(err);
    } else {
      const loginSignature = Message.sign(challenge + selector.timestamp, loginKey);
      Meteor.loginWithBitcoin(selector, loginSignature, (loginErr, userId) => {
        if (loginErr) {
          callback(loginErr);
        } else {
          callback(null, userId);
        }
      });
    }
  });
};

export const login = async function (callback) {
  const loginKey = await getLoginKey();
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
      Meteor.loginWithBitcoin(selector, signature, async (loginErr, userId) => {
        if (loginErr) {
          if (loginErr.error === 404) {
            await createUserAndLogin(loginKey, selector, challenge);
          } else {
            callback(loginErr);
          }
        } else {
          callback(null, userId);
        }
      });
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
